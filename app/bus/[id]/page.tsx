"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BusFront,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  Navigation,
  Share2,
  ShieldCheck,
  Timer,
  UserRound,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createClient } from "@/lib/supabase/client";

type Bus = {
  id: string;
  serviceName: string;
  operator: string;
  operatorType: "Government" | "Private";
  from: string;
  to: string;
  departure: string;
  arrival: string;
  busType: string;
  status: string;
  isVerified: boolean;
};

function formatTime(time: string | null | undefined): string {
  if (!time) return "Not available";

  const [hoursString, minutes] = time.split(":");
  const hours = Number(hoursString);

  if (Number.isNaN(hours)) return time;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
}

export default function BusDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const supabase = createClient();

  const [bus, setBus] = useState<Bus | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    async function loadBus() {
      if (!id) {
        setLoading(false);
        setErrorMessage("Invalid bus service.");
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("services")
        .select(`
          id,
          service_name,
          bus_type,
          service_status,
          is_verified,
          operators (
            name,
            operator_type
          ),
          routes (
            route_name,
            origin_stop:stops!routes_origin_stop_id_fkey (
              name
            ),
            destination_stop:stops!routes_destination_stop_id_fkey (
              name
            )
          ),
          schedules (
            departure_time,
            arrival_time
          )
        `)
        .eq("id", id)
        .eq("service_status", "active")
        .maybeSingle();

      if (error) {
        console.error("Bus details error:", error);
        setErrorMessage("Unable to load this bus service.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage(
          "The bus service does not exist or is not available in the current timetable."
        );
        setLoading(false);
        return;
      }

      const operatorData = Array.isArray(data.operators)
        ? data.operators[0]
        : data.operators;

      const routeData = Array.isArray(data.routes)
        ? data.routes[0]
        : data.routes;

      const originStop = routeData?.origin_stop;
      const destinationStop = routeData?.destination_stop;

      const origin =
        Array.isArray(originStop) ? originStop[0] : originStop;

      const destination =
        Array.isArray(destinationStop)
          ? destinationStop[0]
          : destinationStop;

      const schedule = Array.isArray(data.schedules)
        ? data.schedules[0]
        : data.schedules;

      const operatorType =
        operatorData?.operator_type === "Government"
          ? "Government"
          : "Private";

      const mappedBus: Bus = {
        id: data.id,
        serviceName: data.service_name,
        operator: operatorData?.name ?? "Unknown operator",
        operatorType,
        from: origin?.name ?? "Unknown",
        to: destination?.name ?? "Unknown",
        departure: formatTime(schedule?.departure_time),
        arrival: formatTime(schedule?.arrival_time),
        busType: data.bus_type ?? "Not specified",
        status: "Scheduled",
        isVerified: Boolean(data.is_verified),
      };

      setBus(mappedBus);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: favoriteData } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("service_id", data.id)
          .maybeSingle();

        setFavorite(Boolean(favoriteData));
      } else {
        setFavorite(false);
      }

      setLoading(false);
    }

    loadBus();
  }, [id]);

  async function handleFavorite() {
    if (!bus) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (favorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("service_id", bus.id);

      if (error) {
        console.error("Remove favorite error:", error);
        return;
      }

      setFavorite(false);
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          service_id: bus.id,
        });

      if (error) {
        console.error("Add favorite error:", error);
        return;
      }

      setFavorite(true);
    }
  }

  async function handleShare() {
    if (!bus) return;

    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${bus.serviceName} - Kerala Bus Finder`,
          text: `${bus.from} to ${bus.to} - ${bus.departure}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("Link copied!");

        setTimeout(() => {
          setShareMessage("");
        }, 2000);
      }
    } catch {
      // User cancelled the share dialog.
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
          <Card className="w-full">
            <CardContent className="py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <BusFront className="h-8 w-8 text-muted-foreground" />
              </div>

              <h1 className="mt-5 text-2xl font-bold">
                Loading bus details...
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Getting the latest timetable information.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!bus || errorMessage) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <XCircle className="h-8 w-8 text-muted-foreground" />
              </div>

              <h1 className="text-2xl font-bold">
                Bus not found
              </h1>

              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {errorMessage ||
                  "The bus service you are looking for is not available."}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/search"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Search
                </Link>

                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                >
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              className="-ml-2 w-fit"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant={favorite ? "default" : "outline"}
                onClick={handleFavorite}
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${
                    favorite ? "fill-current" : ""
                  }`}
                />
                {favorite ? "Saved" : "Save"}
              </Button>

              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {shareMessage && (
            <div className="mt-3 text-right text-sm font-medium text-green-600">
              {shareMessage}
            </div>
          )}
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Route heading */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b bg-muted/20 p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        bus.operatorType === "Government"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {bus.operatorType}
                    </Badge>

                    <Badge variant="outline">
                      {bus.status}
                    </Badge>

                    <Badge variant="outline">
                      {bus.busType}
                    </Badge>

                    <Badge
                      variant={
                        bus.isVerified
                          ? "default"
                          : "outline"
                      }
                    >
                      {bus.isVerified
                        ? "Verified"
                        : "Verification pending"}
                    </Badge>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {bus.serviceName}
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {bus.operator}
                  </p>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <BusFront className="h-7 w-7 text-primary" />
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    From
                  </p>

                  <div className="mt-2 flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />

                    <div>
                      <p className="text-xl font-semibold">
                        {bus.from}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Departure
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex">
                  <ArrowRight className="h-7 w-7 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    To
                  </p>

                  <div className="mt-2 flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />

                    <div>
                      <p className="text-xl font-semibold">
                        {bus.to}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Arrival
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/20 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <Clock3 className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Departure
                      </p>

                      <p className="text-xl font-bold">
                        {bus.departure}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
                      <Timer className="h-5 w-5 text-primary" />
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Arrival
                      </p>

                      <p className="text-xl font-bold">
                        {bus.arrival}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Service information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BusFront className="h-5 w-5" />
                Service Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Service
                  </p>

                  <p className="mt-1 font-medium">
                    {bus.serviceName}
                  </p>
                </div>

                <BusFront className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-start justify-between gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Operator
                  </p>

                  <p className="mt-1 font-medium">
                    {bus.operator}
                  </p>
                </div>

                <UserRound className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-start justify-between gap-4 border-b pb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Operator Type
                  </p>

                  <p className="mt-1 font-medium">
                    {bus.operatorType}
                  </p>
                </div>

                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Bus Type
                  </p>

                  <p className="mt-1 font-medium">
                    {bus.busType}
                  </p>
                </div>

                <Navigation className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Schedule information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-primary" />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Departure
                    </p>

                    <p className="mt-1 font-semibold">
                      {bus.departure}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 text-primary" />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Arrival
                    </p>

                    <p className="mt-1 font-semibold">
                      {bus.arrival}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current status
                    </p>

                    <p className="mt-1 font-semibold">
                      {bus.status}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intermediate stops */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Intermediate Stops
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border border-dashed p-6 text-center">
              <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">
                Stop information unavailable
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Intermediate stops have not been verified yet.
                We will show them here once reliable timetable
                data is available.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Live tracking */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Live Tracking
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl border border-dashed p-6 text-center">
              <Navigation className="mx-auto h-8 w-8 text-muted-foreground" />

              <h3 className="mt-3 font-semibold">
                Live tracking is not available
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                This service currently provides scheduled
                timetable information only. Live GPS location
                and ETA are not available yet.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Verification notice */}
        <Card className="mt-6 border-amber-300/60 bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />

              <div>
                <h3 className="font-semibold">
                  Timetable verification
                </h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This service is currently part of the timetable
                  preview. Bus information will be marked as
                  verified after it has been reviewed against
                  reliable sources.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Badge variant="outline">
                    Timetable only
                  </Badge>

                  <Badge variant="outline">
                    No live ETA
                  </Badge>

                  <Badge variant="outline">
                    {bus.isVerified
                      ? "Verified"
                      : "Verification pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/search"
            className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Link>

          <Button
            variant="outline"
            className="flex-1"
            onClick={handleFavorite}
          >
            <Heart
              className={`mr-2 h-4 w-4 ${
                favorite ? "fill-current" : ""
              }`}
            />

            {favorite
              ? "Remove from Favorites"
              : "Add to Favorites"}
          </Button>
        </div>
      </div>
    </main>
  );
}