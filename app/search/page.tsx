"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type FilterType = "All" | "Government" | "Private";

type StopRow = {
  id: string;
  name: string;
};

type RouteRow = {
  id: string;
  origin_stop_id: string;
  destination_stop_id: string;
};

type OperatorRow = {
  id: string;
  name: string;
  operator_type: string | null;
};

type ServiceRow = {
  id: string;
  route_id: string;
  service_name: string;
  bus_type: string | null;
  service_status: string;
  operator_id: string | null;
  is_verified: boolean;
};

type ScheduleRow = {
  id: string;
  service_id: string;
  departure_time: string;
  arrival_time: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_verified: boolean;
};

type BusResult = {
  id: string;
  service: string;
  operator: string;
  operatorType: FilterType | "Unknown";
  departure: string;
  arrival: string;
  duration: string;
  busType: string;
  isVerified: boolean;
};

function formatDate(dateString: string) {
  if (!dateString) {
    return "Date not selected";
  }

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
  if (!time) {
    return "Not available";
  }

  const [hourString, minuteString] = time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour =
    hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${String(minute).padStart(
    2,
    "0",
  )} ${suffix}`;
}

function calculateDuration(
  departure: string,
  arrival: string | null,
) {
  if (!arrival) {
    return "Duration not available";
  }

  const [departureHour, departureMinute] =
    departure.split(":").map(Number);

  const [arrivalHour, arrivalMinute] =
    arrival.split(":").map(Number);

  if (
    [departureHour, departureMinute, arrivalHour, arrivalMinute].some(
      (value) => Number.isNaN(value),
    )
  ) {
    return "Duration not available";
  }

  let departureMinutes =
    departureHour * 60 + departureMinute;

  let arrivalMinutes =
    arrivalHour * 60 + arrivalMinute;

  if (arrivalMinutes < departureMinutes) {
    arrivalMinutes += 24 * 60;
  }

  const durationMinutes =
    arrivalMinutes - departureMinutes;

  const hours = Math.floor(
    durationMinutes / 60,
  );

  const minutes =
    durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

function getOperatorType(
  operatorType: string | null,
  operatorName: string | null,
): FilterType | "Unknown" {
  const normalized =
    operatorType?.trim().toLowerCase();

  if (normalized === "government") {
    return "Government";
  }

  if (normalized === "private") {
    return "Private";
  }

  const name =
    operatorName?.trim().toLowerCase() ?? "";

  if (
    name.includes("ksrtc") ||
    name.includes("government")
  ) {
    return "Government";
  }

  return "Unknown";
}

function SearchResults() {
  const searchParams = useSearchParams();

  const from =
    searchParams.get("from") || "";

  const to =
    searchParams.get("to") || "";

  const travelDate =
    searchParams.get("date") || "";

  const supabase = useMemo(
    () => createClient(),
    [],
  );

  const [filter, setFilter] =
    useState<FilterType>("All");

  const [buses, setBuses] =
    useState<BusResult[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const hasSearch =
    from.trim() !== "" &&
    to.trim() !== "" &&
    travelDate.trim() !== "";

  useEffect(() => {
    let cancelled = false;

    async function loadBuses() {
      if (!hasSearch) {
        setBuses([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        /*
         * Find origin stop.
         */
        const {
          data: originStop,
          error: originError,
        } = await supabase
          .from("stops")
          .select("id, name")
          .ilike("name", from.trim())
          .limit(1)
          .maybeSingle();

        if (originError) {
          throw new Error(
            `Unable to find origin: ${originError.message}`,
          );
        }

        if (!originStop) {
          setBuses([]);
          return;
        }

        /*
         * Find destination stop.
         */
        const {
          data: destinationStop,
          error: destinationError,
        } = await supabase
          .from("stops")
          .select("id, name")
          .ilike("name", to.trim())
          .limit(1)
          .maybeSingle();

        if (destinationError) {
          throw new Error(
            `Unable to find destination: ${destinationError.message}`,
          );
        }

        if (!destinationStop) {
          setBuses([]);
          return;
        }

        /*
         * Find the exact route.
         */
        const {
          data: route,
          error: routeError,
        } = await supabase
          .from("routes")
          .select(
            "id, origin_stop_id, destination_stop_id",
          )
          .eq(
            "origin_stop_id",
            originStop.id,
          )
          .eq(
            "destination_stop_id",
            destinationStop.id,
          )
          .limit(1)
          .maybeSingle();

        if (routeError) {
          throw new Error(
            `Unable to find route: ${routeError.message}`,
          );
        }

        if (!route) {
          setBuses([]);
          return;
        }

        /*
         * Get active services for this route.
         */
        const {
          data: services,
          error: servicesError,
        } = await supabase
          .from("services")
          .select(
            "id, route_id, service_name, bus_type, service_status, operator_id, is_verified",
          )
          .eq("route_id", route.id)
          .eq(
            "service_status",
            "active",
          )
          .order("service_name");

        if (servicesError) {
          throw new Error(
            `Unable to load services: ${servicesError.message}`,
          );
        }

        if (
          !services ||
          services.length === 0
        ) {
          setBuses([]);
          return;
        }

        const serviceIds =
          services.map(
            (service) => service.id,
          );

        /*
         * Get schedules for these services.
         */
        const {
          data: schedules,
          error: schedulesError,
        } = await supabase
          .from("schedules")
          .select(
            "id, service_id, departure_time, arrival_time, valid_from, valid_until, is_verified",
          )
          .in(
            "service_id",
            serviceIds,
          )
          .order("departure_time");

        if (schedulesError) {
          throw new Error(
            `Unable to load schedules: ${schedulesError.message}`,
          );
        }

        /*
         * Get operators only when
         * services actually have one.
         */
        const operatorIds = [
          ...new Set(
            services
              .map(
                (service) =>
                  service.operator_id,
              )
              .filter(
                (id): id is string =>
                  Boolean(id),
              ),
          ),
        ];

        let operators: OperatorRow[] =
          [];

        if (operatorIds.length > 0) {
          const {
            data: operatorData,
            error: operatorError,
          } = await supabase
            .from("operators")
            .select(
              "id, name, operator_type",
            )
            .in(
              "id",
              operatorIds,
            );

          if (operatorError) {
            throw new Error(
              `Unable to load operators: ${operatorError.message}`,
            );
          }

          operators =
            (operatorData ??
              []) as OperatorRow[];
        }

        const operatorMap =
          new Map(
            operators.map(
              (operator) => [
                operator.id,
                operator,
              ],
            ),
          );

        const serviceMap =
          new Map(
            services.map(
              (service) => [
                service.id,
                service,
              ],
            ),
          );

        const results: BusResult[] =
          [];

        for (const schedule of schedules ??
          []) {
          const service =
            serviceMap.get(
              schedule.service_id,
            );

          if (!service) {
            continue;
          }

          /*
           * The current imported dataset does not
           * contain operating-day information.
           *
           * Therefore we deliberately do not
           * claim that a service is confirmed for
           * the selected date.
           *
           * valid_from / valid_until are still
           * respected if they are populated.
           */
          if (
            schedule.valid_from &&
            travelDate <
              schedule.valid_from
          ) {
            continue;
          }

          if (
            schedule.valid_until &&
            travelDate >
              schedule.valid_until
          ) {
            continue;
          }

          const operator =
            service.operator_id
              ? operatorMap.get(
                  service.operator_id,
                )
              : undefined;

          const operatorType =
            getOperatorType(
              operator?.operator_type ??
                null,
              operator?.name ?? null,
            );

          results.push({
            id: service.id,

            service:
              service.service_name,

            operator:
              operator?.name ??
              "Operator not specified",

            operatorType,

            departure:
              formatTime(
                schedule.departure_time,
              ),

            arrival:
              formatTime(
                schedule.arrival_time,
              ),

            duration:
              calculateDuration(
                schedule.departure_time,
                schedule.arrival_time,
              ),

            busType:
              service.bus_type ??
              "Bus type not specified",

            isVerified:
              service.is_verified &&
              schedule.is_verified,
          });
        }

        if (!cancelled) {
          setBuses(results);
        }
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        console.error(
          "Bus search error:",
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load bus results.",
        );

        setBuses([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBuses();

    return () => {
      cancelled = true;
    };
  }, [
    from,
    to,
    travelDate,
    hasSearch,
    supabase,
  ]);

  const filteredBuses =
    useMemo(() => {
      if (filter === "All") {
        return buses;
      }

      return buses.filter(
        (bus) =>
          bus.operatorType === filter,
      );
    }, [buses, filter]);

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold">
              Bus Search Results
            </h1>

            <p className="text-sm text-muted-foreground">
              Find scheduled buses for
              your journey.
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
                  <p className="text-sm text-muted-foreground">
                    Journey
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold">
                      {from ||
                        "Starting point"}
                    </span>

                    <ArrowRight className="h-4 w-4 text-muted-foreground" />

                    <span className="font-semibold">
                      {to ||
                        "Destination"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />

                  <span>
                    {formatDate(
                      travelDate,
                    )}
                  </span>
                </div>

                <Badge variant="outline">
                  {loading
                    ? "Loading..."
                    : `${filteredBuses.length} buses`}
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
                  Search information is
                  incomplete
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Please return to the
                  home page and select
                  your starting point,
                  destination and travel
                  date.
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
                  <p className="font-medium">
                    Unverified timetable
                    data
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    These are scheduled
                    timetable records.
                    Operator details,
                    arrival times and
                    operating days may
                    not be available for
                    every service.
                  </p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="border-destructive/40">
                <CardContent className="p-5">
                  <p className="font-medium text-destructive">
                    Unable to load bus
                    results
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {error}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Results
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      "All",
                      "Government",
                      "Private",
                    ] as FilterType[]
                  ).map(
                    (item) => (
                      <Button
                        key={item}
                        variant={
                          filter === item
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setFilter(
                            item,
                          )
                        }
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
                  <h2 className="text-lg font-semibold">
                    Available Buses
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Scheduled services
                    matching your
                    search.
                  </p>
                </div>

                <Badge variant="outline">
                  {loading
                    ? "Loading..."
                    : `${filteredBuses.length} Results`}
                </Badge>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <BusFront className="mx-auto h-9 w-9 animate-pulse text-muted-foreground" />

                    <p className="mt-3 font-medium">
                      Loading buses...
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Searching the
                      timetable database.
                    </p>
                  </CardContent>
                </Card>
              ) : filteredBuses.length ===
                0 ? (
                <Card>
                  <CardContent className="p-10 text-center">
                    <BusFront className="mx-auto h-9 w-9 text-muted-foreground" />

                    <p className="mt-3 font-medium">
                      No buses found
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      No scheduled services
                      matched this route
                      and filter.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredBuses.map(
                  (bus) => (
                    <Card
                      key={`${bus.id}-${bus.departure}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex items-center gap-5">
                            <div className="text-center">
                              <p className="text-xl font-bold">
                                {
                                  bus.departure
                                }
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Departure
                              </p>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                              <div className="h-px w-10 bg-border sm:w-16" />

                              <span className="text-xs text-muted-foreground">
                                {
                                  bus.duration
                                }
                              </span>

                              <div className="h-px w-10 bg-border sm:w-16" />
                            </div>

                            <div className="text-center">
                              <p className="text-xl font-bold">
                                {
                                  bus.arrival
                                }
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Arrival
                              </p>
                            </div>
                          </div>

                          <Separator className="lg:hidden" />

                          <div className="flex-1 lg:px-6">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">
                                {
                                  bus.service
                                }
                              </h3>

                              {bus.operatorType !==
                                "Unknown" && (
                                <Badge variant="outline">
                                  {
                                    bus.operatorType
                                  }
                                </Badge>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {
                                bus.operator
                              }
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="secondary">
                                {
                                  bus.busType
                                }
                              </Badge>

                              <Badge variant="outline">
                                {bus.isVerified
                                  ? "Verified"
                                  : "Unverified"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 lg:items-end">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />

                              <span>
                                {from}{" "}
                                →{" "}
                                {to}
                              </span>
                            </div>

                            <Link
                              href={`/bus/${bus.id}`}
                            >
                              <Button>
                                View Details
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-sm text-muted-foreground">
              Loading bus search...
            </p>
          </div>
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}