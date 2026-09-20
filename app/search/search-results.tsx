"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BusFront,
  CalendarDays,
  Clock3,
  Filter,
  MapPin,
  Search,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

type FilterType = "All" | "Government" | "Private";

type BusResult = {
  id: string;
  service: string;
  operator: string;
  operatorType: "Government" | "Private";
  departure: string;
  arrival: string;
  duration: string;
  busType: string;
};

type SupabaseService = {
  id: string;
  service_name: string;
  bus_type: string | null;
  service_status: string;
  operator_id: string | null;
  route_id: string;
  operators:
    | {
        name: string;
        operator_type: "Government" | "Private";
      }
    | null;
  routes:
    | {
        route_name: string;
        origin_stop_id: string | null;
        destination_stop_id: string | null;
        origin_stop:
          | {
              name: string;
            }
          | null;
        destination_stop:
          | {
              name: string;
            }
          | null;
      }
    | null;
  schedules:
    | {
        departure_time: string;
        arrival_time: string | null;
      }[]
    | null;
};

function formatDate(dateString: string) {
  if (!dateString) return "Date not selected";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string | null) {
  if (!time) return "—";

  const [hoursString, minutesString] = time.split(":");

  const hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDuration(
  departureTime: string | null,
  arrivalTime: string | null,
) {
  if (!departureTime || !arrivalTime) {
    return "Duration unavailable";
  }

  const [departureHours, departureMinutes] = departureTime
    .split(":")
    .map(Number);

  const [arrivalHours, arrivalMinutes] = arrivalTime
    .split(":")
    .map(Number);

  if (
    [departureHours, departureMinutes, arrivalHours, arrivalMinutes].some(
      Number.isNaN,
    )
  ) {
    return "Duration unavailable";
  }

  let departureMinutesTotal = departureHours * 60 + departureMinutes;
  let arrivalMinutesTotal = arrivalHours * 60 + arrivalMinutes;

  if (arrivalMinutesTotal < departureMinutesTotal) {
    arrivalMinutesTotal += 24 * 60;
  }

  const durationMinutes = arrivalMinutesTotal - departureMinutesTotal;

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const travelDate = searchParams.get("date") || "";

  const [filter, setFilter] = useState<FilterType>("All");
  const [buses, setBuses] = useState<BusResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasSearch =
    from.trim() !== "" &&
    to.trim() !== "" &&
    travelDate.trim() !== "";

  useEffect(() => {
    let cancelled = false;

    async function loadBuses() {
      if (!hasSearch) {
        setBuses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: supabaseError } = await supabase
        .from("services")
        .select(
          `
            id,
            service_name,
            bus_type,
            service_status,
            operator_id,
            route_id,
            operators (
              name,
              operator_type
            ),
            routes (
              route_name,
              origin_stop_id,
              destination_stop_id,
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
          `,
        )
        .eq("service_status", "active");

      if (cancelled) return;

      if (supabaseError) {
        console.error("Supabase search error:", supabaseError);
        setError(
          "We couldn't load the timetable right now. Please try again.",
        );
        setBuses([]);
        setLoading(false);
        return;
      }

      const services = (data ?? []) as unknown as SupabaseService[];

      const normalizedFrom = from.trim().toLowerCase();
      const normalizedTo = to.trim().toLowerCase();

      const results: BusResult[] = [];

      for (const service of services) {
        const route = service.routes;

        if (!route) continue;

        const originName =
          route.origin_stop?.name?.trim().toLowerCase() || "";
        const destinationName =
          route.destination_stop?.name?.trim().toLowerCase() || "";

        if (
          originName !== normalizedFrom ||
          destinationName !== normalizedTo
        ) {
          continue;
        }

        const operator = service.operators;

        if (!operator) continue;

        const schedule = service.schedules?.[0];

        if (!schedule) continue;

        results.push({
          id: service.id,
          service: service.service_name,
          operator: operator.name,
          operatorType: operator.operator_type,
          departure: formatTime(schedule.departure_time),
          arrival: formatTime(schedule.arrival_time),
          duration: getDuration(
            schedule.departure_time,
            schedule.arrival_time,
          ),
          busType: service.bus_type || "Bus type unavailable",
        });
      }

      setBuses(results);
      setLoading(false);
    }

    void loadBuses();

    return () => {
      cancelled = true;
    };
  }, [from, to, travelDate, hasSearch, supabase]);

  const filteredBuses = useMemo(() => {
    if (filter === "All") {
      return buses;
    }

    return buses.filter((bus) => bus.operatorType === filter);
  }, [buses, filter]);

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold">Bus Search Results</h1>

            <p className="text-sm text-muted-foreground">
              Find scheduled buses for your journey.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                  <BusFront className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Journey</p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {from || "Starting point"}
                    </span>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    <span className="font-semibold">
                      {to || "Destination"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />

                  <span>{formatDate(travelDate)}</span>
                </div>

                <Badge variant="outline">
                  {loading ? "Loading..." : `${filteredBuses.length} buses`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {!hasSearch && (
          <Card className="border-destructive/40">
            <CardContent className="flex items-start gap-3 p-5">
              <TriangleAlert className="mt-0.5 h-5 w-5 text-destructive" />

              <div>
                <p className="font-medium">
                  Search information is incomplete
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Please return to the home page and select your starting
                  point, destination and travel date.
                </p>

                <Link href="/">
                  <Button className="mt-4">
                    <Search className="mr-2 h-4 w-4" />
                    New Search
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {hasSearch && (
          <>
            <Card className="border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
              <CardContent className="flex items-start gap-3 p-4">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="font-medium">Unverified timetable data</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    These are scheduled timetable records imported from the
                    current source dataset. They have not yet been independently
                    verified and are not live tracking or ETA data.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Results
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(["All", "Government", "Private"] as FilterType[]).map(
                    (item) => (
                      <Button
                        key={item}
                        variant={filter === item ? "default" : "outline"}
                        onClick={() => setFilter(item)}
                      >
                        {item}
                      </Button>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Available Buses</h2>

                  <p className="text-sm text-muted-foreground">
                    Scheduled services matching your search.
                  </p>
                </div>

                <Badge variant="outline">
                  {loading ? "Loading..." : `${filteredBuses.length} Results`}
                </Badge>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <BusFront className="mx-auto h-9 w-9 animate-pulse text-muted-foreground" />

                    <p className="mt-3 font-medium">
                      Loading timetable results...
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Fetching the latest available timetable records.
                    </p>
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="border-destructive/40">
                  <CardContent className="p-10 text-center">
                    <TriangleAlert className="mx-auto h-9 w-9 text-destructive" />

                    <p className="mt-3 font-medium">
                      Unable to load timetable
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {error}
                    </p>
                  </CardContent>
                </Card>
              ) : filteredBuses.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <BusFront className="mx-auto h-9 w-9 text-muted-foreground" />

                    <p className="mt-3 font-medium">No buses found</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Try another operator filter or search.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredBuses.map((bus) => (
                  <Card key={bus.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-5">
                          <div className="text-center">
                            <p className="text-xl font-bold">
                              {bus.departure}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Departure
                            </p>
                          </div>

                          <div className="flex flex-col items-center gap-1">
                            <div className="h-px w-10 bg-border sm:w-16" />

                            <span className="text-xs text-muted-foreground">
                              {bus.duration}
                            </span>

                            <div className="h-px w-10 bg-border sm:w-16" />
                          </div>

                          <div className="text-center">
                            <p className="text-xl font-bold">
                              {bus.arrival}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Arrival
                            </p>
                          </div>
                        </div>

                        <Separator className="lg:hidden" />

                        <div className="flex-1 lg:px-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{bus.service}</h3>

                            <Badge variant="outline">
                              {bus.operatorType}
                            </Badge>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {bus.operator}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant="secondary">{bus.busType}</Badge>

                            <Badge variant="outline">Unverified</Badge>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:items-end">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />

                            <span>
                              {from} → {to}
                            </span>
                          </div>

                          <Link href={`/bus/${bus.id}`}>
                            <Button>
                              View Details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}