"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createClient } from "@/lib/supabase/client";

type FavoriteBus = {
  id: string;
  serviceName: string;
  operator: string;
  operatorType: "Government" | "Private";
  from: string;
  to: string;
  departure: string;
  arrival: string;
  busType: string;
};

type ServiceRow = {
  id: string;
  service_name: string;
  bus_type: string | null;
  operators:
    | {
        name: string;
        operator_type: "Government" | "Private";
      }
    | null;
  routes:
    | {
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

function formatTime(time: string | null) {
  if (!time) return "—";

  const [hours, minutes] = time.split(":").map(Number);

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

export default function FavoritesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [favorites, setFavorites] = useState<FavoriteBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadFavorites() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
      setError("Unable to check your account.");
      setLoading(false);
      return;
    }

    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const { data: favoriteRows, error: favoritesError } = await supabase
      .from("favorites")
      .select("service_id")
      .eq("user_id", user.id);

    if (favoritesError) {
      console.error(favoritesError);
      setError("Unable to load your favorites.");
      setLoading(false);
      return;
    }

    const serviceIds = (favoriteRows ?? []).map(
      (favorite) => favorite.service_id,
    );

    if (serviceIds.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select(
        `
          id,
          service_name,
          bus_type,
          operators (
            name,
            operator_type
          ),
          routes (
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
      .in("id", serviceIds);

    if (servicesError) {
      console.error(servicesError);
      setError("Unable to load your saved bus services.");
      setLoading(false);
      return;
    }

    const result: FavoriteBus[] = [];

    for (const service of (services ?? []) as unknown as ServiceRow[]) {
      const operator = service.operators;
      const route = service.routes;
      const schedule = service.schedules?.[0];

      if (!operator || !route || !schedule) continue;

      result.push({
        id: service.id,
        serviceName: service.service_name,
        operator: operator.name,
        operatorType: operator.operator_type,
        from: route.origin_stop?.name ?? "Unknown",
        to: route.destination_stop?.name ?? "Unknown",
        departure: formatTime(schedule.departure_time),
        arrival: formatTime(schedule.arrival_time),
        busType: service.bus_type ?? "Unknown",
      });
    }

    setFavorites(result);
    setLoading(false);
  }

  useEffect(() => {
    void loadFavorites();
  }, []);

  async function handleRemove(serviceId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: deleteError } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("service_id", serviceId);

    if (deleteError) {
      console.error(deleteError);
      setError("Unable to remove this favorite.");
      return;
    }

    setFavorites((current) =>
      current.filter((bus) => bus.id !== serviceId),
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="font-medium">Loading favorites...</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Checking your saved bus services.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Heart className="h-7 w-7 fill-current" />

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Favorites
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Your saved bus services.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/40">
            <CardContent className="flex gap-3 p-4">
              <TriangleAlert className="h-5 w-5 text-destructive" />

              <p className="text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground" />

              <h2 className="mt-4 text-xl font-semibold">
                No favorites yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Save a bus service from its details page and it will
                appear here.
              </p>

              <Button
                className="mt-6"
                onClick={() => router.push("/search")}
              >
                Find Buses
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {favorites.length}{" "}
              {favorites.length === 1 ? "favorite" : "favorites"} saved
            </div>

            {favorites.map((bus) => (
              <Card key={bus.id}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle>{bus.serviceName}</CardTitle>

                        <Badge variant="secondary">
                          {bus.operatorType}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {bus.operator}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(bus.id)}
                      aria-label={`Remove ${bus.serviceName} from favorites`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="rounded-lg border p-4">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          From
                        </p>

                        <p className="font-semibold">{bus.from}</p>
                      </div>

                      <div className="hidden text-center sm:block">
                        <div className="text-sm text-muted-foreground">
                          →
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <p className="text-sm text-muted-foreground">
                          To
                        </p>

                        <p className="font-semibold">{bus.to}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Departure
                      </p>

                      <p className="font-medium">{bus.departure}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Arrival
                      </p>

                      <p className="font-medium">{bus.arrival}</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Bus Type
                      </p>

                      <p className="font-medium">{bus.busType}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={() =>
                        router.push(`/bus/${bus.id}`)
                      }
                    >
                      View Details
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleRemove(bus.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}