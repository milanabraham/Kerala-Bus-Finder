"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Search,
  Send,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { createClient } from "@/lib/supabase/client";

type TimetableStatus = "Published" | "Unverified";

type Timetable = {
  id: string;
  service: string;
  operator: string;
  operatorType: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  days: string;
  busType: string;
  status: TimetableStatus;
};

type ServiceRow = {
  id: string;
  service_name: string;
  bus_type: string | null;
  service_status: string;
  is_verified: boolean;
  operator_id: string | null;
  route_id: string;
};

type OperatorRow = {
  id: string;
  name: string;
  operator_type: string;
};

type RouteRow = {
  id: string;
  route_name: string;
  operator_id: string | null;
  origin_stop_id: string | null;
  destination_stop_id: string | null;
  is_verified: boolean;
};

type StopRow = {
  id: string;
  name: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
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

type SubmissionRow = {
  id: string;
  route_name: string;
  operator_name: string | null;
  operator_type: string | null;
  origin_name: string;
  destination_name: string;
  bus_type: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  operating_days: string | null;
  notes: string | null;
  source_url: string | null;
  status: string;
  published_service_id: string | null;
  published_at: string | null;
};

function formatTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const parts = value.split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function normalizeTime(value: string | null) {
  if (!value) {
    return null;
  }

  return value.slice(0, 8);
}

function getOperatorType(
  operatorType: string | null | undefined,
  operatorName: string | null | undefined,
) {
  const type = (operatorType ?? "").toLowerCase();
  const name = (operatorName ?? "").toLowerCase();

  if (
    type.includes("government") ||
    type.includes("gov") ||
    name.includes("ksrtc")
  ) {
    return "Government";
  }

  if (
    type.includes("private") ||
    name.includes("private")
  ) {
    return "Private";
  }

  return "Other";
}

function formatDays(value: string | null) {
  if (!value || !value.trim()) {
    return "Not specified";
  }

  return value;
}

export default function AdminTimetablesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [timetables, setTimetables] = useState<Timetable[]>(
    [],
  );

  const [approvedSubmissions, setApprovedSubmissions] =
    useState<SubmissionRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "All" | TimetableStatus
  >("All");

  const [operatorFilter, setOperatorFilter] = useState<
    "All" | "Government" | "Private"
  >("All");

  async function loadTimetables() {
    setLoading(true);
    setError("");

    const [
      servicesResult,
      operatorsResult,
      routesResult,
      stopsResult,
      schedulesResult,
      submissionsResult,
    ] = await Promise.all([
      supabase
        .from("services")
        .select(
          "id, service_name, bus_type, service_status, is_verified, operator_id, route_id",
        )
        .order("service_name"),

      supabase
        .from("operators")
        .select("id, name, operator_type")
        .order("name"),

      supabase
        .from("routes")
        .select(
          "id, route_name, operator_id, origin_stop_id, destination_stop_id, is_verified",
        ),

      supabase
        .from("stops")
        .select(
          "id, name, district, latitude, longitude, is_verified",
        )
        .order("name"),

      supabase
        .from("schedules")
        .select(
          "id, service_id, departure_time, arrival_time, valid_from, valid_until, is_verified",
        )
        .order("departure_time"),

      supabase
        .from("route_submissions")
        .select(
          "id, route_name, operator_name, operator_type, origin_name, destination_name, bus_type, departure_time, arrival_time, operating_days, notes, source_url, status, published_service_id, published_at",
        )
        .eq("status", "approved")
        .is("published_at", null)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (servicesResult.error) {
      setError(servicesResult.error.message);
      setLoading(false);
      return;
    }

    if (operatorsResult.error) {
      setError(operatorsResult.error.message);
      setLoading(false);
      return;
    }

    if (routesResult.error) {
      setError(routesResult.error.message);
      setLoading(false);
      return;
    }

    if (stopsResult.error) {
      setError(stopsResult.error.message);
      setLoading(false);
      return;
    }

    if (schedulesResult.error) {
      setError(schedulesResult.error.message);
      setLoading(false);
      return;
    }

    if (submissionsResult.error) {
      setError(submissionsResult.error.message);
      setLoading(false);
      return;
    }

    const services =
      (servicesResult.data ?? []) as ServiceRow[];

    const operators =
      (operatorsResult.data ?? []) as OperatorRow[];

    const routes =
      (routesResult.data ?? []) as RouteRow[];

    const stops =
      (stopsResult.data ?? []) as StopRow[];

    const schedules =
      (schedulesResult.data ?? []) as ScheduleRow[];

    const operatorMap = new Map(
      operators.map((operator) => [
        operator.id,
        operator,
      ]),
    );

    const routeMap = new Map(
      routes.map((route) => [route.id, route]),
    );

    const stopMap = new Map(
      stops.map((stop) => [stop.id, stop]),
    );

    const schedulesByService = new Map<
      string,
      ScheduleRow[]
    >();

    for (const schedule of schedules) {
      const existing =
        schedulesByService.get(schedule.service_id) ?? [];

      existing.push(schedule);

      schedulesByService.set(
        schedule.service_id,
        existing,
      );
    }

    const rows: Timetable[] = [];

    for (const service of services) {
      if (service.service_status !== "active") {
        continue;
      }

      const route = routeMap.get(service.route_id);

      if (!route) {
        continue;
      }

      const operator = service.operator_id
        ? operatorMap.get(service.operator_id)
        : undefined;

      const origin = route.origin_stop_id
        ? stopMap.get(route.origin_stop_id)
        : undefined;

      const destination = route.destination_stop_id
        ? stopMap.get(route.destination_stop_id)
        : undefined;

      if (!origin || !destination) {
        continue;
      }

      const serviceSchedules =
        schedulesByService.get(service.id) ?? [];

      for (const schedule of serviceSchedules) {
        rows.push({
          id: service.id,
          service: service.service_name,
          operator:
            operator?.name ?? "Unknown operator",
          operatorType: getOperatorType(
            operator?.operator_type,
            operator?.name,
          ),
          from: origin.name,
          to: destination.name,
          departure: formatTime(
            schedule.departure_time,
          ),
          arrival: formatTime(
            schedule.arrival_time,
          ),
          days: "Not specified",
          busType:
            service.bus_type ?? "Not specified",
          status: service.is_verified
            ? "Published"
            : "Unverified",
        });
      }
    }

    setTimetables(rows);

    setApprovedSubmissions(
      (submissionsResult.data ??
        []) as SubmissionRow[],
    );

    setLoading(false);
  }

  useEffect(() => {
    loadTimetables();
  }, []);

  const filteredTimetables = useMemo(() => {
    const query = search.trim().toLowerCase();

    return timetables.filter((item) => {
      const matchesSearch =
        !query ||
        item.service
          .toLowerCase()
          .includes(query) ||
        item.operator
          .toLowerCase()
          .includes(query) ||
        item.from
          .toLowerCase()
          .includes(query) ||
        item.to
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      const matchesOperator =
        operatorFilter === "All" ||
        item.operatorType === operatorFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesOperator
      );
    });
  }, [
    timetables,
    search,
    statusFilter,
    operatorFilter,
  ]);

  const publishedCount = timetables.filter(
    (item) => item.status === "Published",
  ).length;

  const unverifiedCount = timetables.filter(
    (item) => item.status === "Unverified",
  ).length;

  function getStatusBadge(
    status: TimetableStatus,
  ) {
    if (status === "Published") {
      return (
        <Badge>
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Published
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <XCircle className="mr-1 h-3.5 w-3.5" />
        Unverified
      </Badge>
    );
  }

  async function findOrCreateStop(name: string): Promise<StopRow> {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error("Stop name is required.");
  }

  // Find an existing stop.
  // Do NOT use .single() because duplicate stop names may already exist.
  const { data: existingStops, error: findError } = await supabase
    .from("stops")
    .select("*")
    .ilike("name", cleanName)
    .order("created_at", { ascending: true })
    .limit(1);

  if (findError) {
    throw new Error(
      `Unable to find stop "${cleanName}": ${findError.message}`,
    );
  }

 if (existingStops && existingStops.length > 0) {
  const existingStop = existingStops[0];

  const { error: verifyError } = await supabase
    .from("stops")
    .update({
      is_verified: true,
    })
    .eq("id", existingStop.id);

  if (verifyError) {
    throw new Error(
      `Unable to verify stop "${cleanName}": ${verifyError.message}`,
    );
  }

  return {
    ...existingStop,
    is_verified: true,
  } as StopRow;
}

  // Stop does not exist, so create it.
  const { data: newStop, error: insertError } = await supabase
    .from("stops")
    .insert({
      name: cleanName,
      is_verified: true,
    })
    .select("*")
    .single();

 if (insertError) {
  const message = insertError?.message ?? "Unknown database error";

  throw new Error(
    `Unable to create stop "${cleanName}": ${message}`,
  );
}

  if (!newStop) {
    throw new Error(`Unable to create stop "${cleanName}".`);
  }

  return newStop as StopRow;
}

  async function findOrCreateOperator(
    submission: SubmissionRow,
  ): Promise<OperatorRow> {
    const cleanName =
      submission.operator_name?.trim();

    if (!cleanName) {
      throw new Error(
        "The approved submission does not contain an operator name.",
      );
    }

    const operatorType =
      submission.operator_type?.trim();

    if (!operatorType) {
      throw new Error(
        `Operator type is missing for "${cleanName}". Add the operator type before publishing.`,
      );
    }

    const {
      data: existingOperator,
      error: lookupError,
    } = await supabase
      .from("operators")
      .select(
        "id, name, operator_type",
      )
      .ilike("name", cleanName)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    if (existingOperator) {
      const { data: verifiedOperator, error: updateError } =
        await supabase
          .from("operators")
          .update({
            operator_type: operatorType,
            is_verified: true,
          })
          .eq("id", existingOperator.id)
          .select(
            "id, name, operator_type",
          )
          .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      return verifiedOperator as OperatorRow;
    }

    const {
      data: newOperator,
      error: insertError,
    } = await supabase
      .from("operators")
      .insert({
        name: cleanName,
        operator_type: operatorType,
        is_verified: true,
      })
      .select(
        "id, name, operator_type",
      )
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    if (!newOperator) {
      throw new Error(
        `Unable to create operator "${cleanName}".`,
      );
    }

    return newOperator as OperatorRow;
  }

  async function findOrCreateRoute(
    submission: SubmissionRow,
    operatorId: string,
    originStopId: string,
    destinationStopId: string,
  ): Promise<RouteRow> {
    const routeName =
      `${submission.origin_name.trim()} → ${submission.destination_name.trim()}`;

    const {
      data: existingRoutes,
      error: lookupError,
    } = await supabase
      .from("routes")
      .select(
        "id, route_name, operator_id, origin_stop_id, destination_stop_id, is_verified",
      )
      .eq("origin_stop_id", originStopId)
      .eq(
        "destination_stop_id",
        destinationStopId,
      )
      .eq("operator_id", operatorId)
      .limit(1);

    if (lookupError) {
      throw new Error(lookupError.message);
    }

    const existingRoute = existingRoutes?.[0];

    if (existingRoute) {
      const { data: verifiedRoute, error: updateError } =
        await supabase
          .from("routes")
          .update({
            route_name: routeName,
            is_verified: true,
          })
          .eq("id", existingRoute.id)
          .select(
            "id, route_name, operator_id, origin_stop_id, destination_stop_id, is_verified",
          )
          .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      return verifiedRoute as RouteRow;
    }

    const {
      data: newRoute,
      error: insertError,
    } = await supabase
      .from("routes")
      .insert({
        route_name: routeName,
        operator_id: operatorId,
        origin_stop_id: originStopId,
        destination_stop_id: destinationStopId,
        is_verified: true,
      })
      .select(
        "id, route_name, operator_id, origin_stop_id, destination_stop_id, is_verified",
      )
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    if (!newRoute) {
      throw new Error(
        `Unable to create route "${routeName}".`,
      );
    }

    return newRoute as RouteRow;
  }

  async function publishSubmission(
    submission: SubmissionRow,
  ) {
    setPublishingId(submission.id);
    setMessage("");
    setError("");

    try {
      if (submission.status !== "approved") {
        throw new Error(
          "Only approved submissions can be published.",
        );
      }

      if (submission.published_at) {
        throw new Error(
          "This submission has already been published.",
        );
      }

      if (
        !submission.departure_time ||
        !submission.arrival_time
      ) {
        throw new Error(
          "This submission must contain both departure and arrival times.",
        );
      }

      /*
       * 1. Find or create the origin stop.
       */
      const originStop =
        await findOrCreateStop(
          submission.origin_name,
        );

      /*
       * 2. Find or create the destination stop.
       */
      const destinationStop =
        await findOrCreateStop(
          submission.destination_name,
        );

      /*
       * 3. Find or create the approved operator.
       */
      const operator =
        await findOrCreateOperator(
          submission,
        );

      /*
       * 4. Find or create the route.
       *
       * route_name is the actual route:
       * Kottayam → Ernakulam
       *
       * submission.route_name is the service name:
       * Morning service
       */
      const route =
        await findOrCreateRoute(
          submission,
          operator.id,
          originStop.id,
          destinationStop.id,
        );

      /*
       * 5. Find an existing service.
       *
       * The submitted route_name is used as the service name.
       */
      const {
        data: existingServices,
        error: serviceLookupError,
      } = await supabase
        .from("services")
        .select(
          "id, service_name, bus_type, service_status, is_verified, operator_id, route_id",
        )
        .eq("route_id", route.id)
        .eq("operator_id", operator.id)
        .eq(
          "service_name",
          submission.route_name.trim(),
        )
        .limit(1);

      if (serviceLookupError) {
        throw new Error(
          serviceLookupError.message,
        );
      }

      let serviceId: string;

      const existingService =
        existingServices?.[0];

      if (existingService) {
        serviceId = existingService.id;

        const {
          error: serviceUpdateError,
        } = await supabase
          .from("services")
          .update({
            bus_type:
              submission.bus_type || null,
            service_status: "active",
            is_verified: true,
          })
          .eq("id", serviceId);

        if (serviceUpdateError) {
          throw new Error(
            serviceUpdateError.message,
          );
        }
      } else {
        const {
          data: newService,
          error: serviceInsertError,
        } = await supabase
          .from("services")
          .insert({
            route_id: route.id,
            service_name:
              submission.route_name.trim(),
            bus_type:
              submission.bus_type || null,
            service_status: "active",
            is_verified: true,
            operator_id: operator.id,
          })
          .select("id")
          .single();

        if (serviceInsertError) {
          throw new Error(
            serviceInsertError.message,
          );
        }

        if (!newService) {
          throw new Error(
            "The service could not be created.",
          );
        }

        serviceId = newService.id;
      }

      /*
       * 6. Normalize schedule times.
       */
      const departure = normalizeTime(
        submission.departure_time,
      );

      const arrival = normalizeTime(
        submission.arrival_time,
      );

      if (!departure || !arrival) {
        throw new Error(
          "Invalid departure or arrival time.",
        );
      }

      /*
       * 7. Find or create the schedule.
       */
      const {
        data: existingSchedules,
        error: scheduleLookupError,
      } = await supabase
        .from("schedules")
        .select(
          "id, service_id, departure_time, arrival_time, valid_from, valid_until, is_verified",
        )
        .eq("service_id", serviceId)
        .eq(
          "departure_time",
          departure,
        )
        .eq(
          "arrival_time",
          arrival,
        )
        .limit(1);

      if (scheduleLookupError) {
        throw new Error(
          scheduleLookupError.message,
        );
      }

      const existingSchedule =
        existingSchedules?.[0];

      if (existingSchedule) {
        const {
          error: scheduleUpdateError,
        } = await supabase
          .from("schedules")
          .update({
            is_verified: true,
          })
          .eq("id", existingSchedule.id);

        if (scheduleUpdateError) {
          throw new Error(
            scheduleUpdateError.message,
          );
        }
      } else {
        const {
          error: scheduleInsertError,
        } = await supabase
          .from("schedules")
          .insert({
            service_id: serviceId,
            departure_time: departure,
            arrival_time: arrival,
            is_verified: true,
          });

        if (scheduleInsertError) {
          throw new Error(
            scheduleInsertError.message,
          );
        }
      }

      /*
       * We intentionally do not create:
       *
       * - service_stops
       * - schedule_weekdays
       * - schedule_exceptions
       *
       * from the free-text submission because those
       * records require verified structured information.
       */

      /*
       * 8. Mark the submission as published.
       *
       * This prevents the same approved submission
       * from appearing in the Publish queue again.
       */
      const {
        error: publicationUpdateError,
      } = await supabase
        .from("route_submissions")
        .update({
          published_service_id: serviceId,
          published_at: new Date().toISOString(),
        })
        .eq("id", submission.id)
        .is("published_at", null);

      if (publicationUpdateError) {
        throw new Error(
          publicationUpdateError.message,
        );
      }

      setMessage(
        `"${submission.route_name}" was published successfully.`,
      );

      await loadTimetables();
    } catch (publishError) {
  console.error("PUBLISH ERROR:", publishError);

  const errorMessage =
    publishError instanceof Error
      ? publishError.message
      : String(publishError);

  console.error("PUBLISH ERROR MESSAGE:", errorMessage);

  setError(`Publish failed: ${errorMessage}`);
} finally {
      setPublishingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                router.push("/admin")
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <h1 className="text-xl font-semibold">
                Timetable Management
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage timetable entries and approved
                submissions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Information */}
        <Card className="border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <p className="font-medium">
                Timetable data comes from Supabase
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Existing timetable records are loaded
                directly from the database. Approved
                submissions can be published from this page.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Loading timetable data...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/40">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {message && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />

              <p className="text-sm">{message}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Total Timetables
              </p>

              <p className="mt-1 text-2xl font-bold">
                {timetables.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Published / Verified
              </p>

              <p className="mt-1 text-2xl font-bold">
                {publishedCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Unverified
              </p>

              <p className="mt-1 text-2xl font-bold">
                {unverifiedCount}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Approved Submissions
              </p>

              <p className="mt-1 text-2xl font-bold">
                {approvedSubmissions.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search service, operator or route..."
                className="pl-9"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "All"
                        | TimetableStatus,
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="All">
                    All Statuses
                  </option>

                  <option value="Published">
                    Published / Verified
                  </option>

                  <option value="Unverified">
                    Unverified
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Operator Type
                </label>

                <select
                  value={operatorFilter}
                  onChange={(e) =>
                    setOperatorFilter(
                      e.target.value as
                        | "All"
                        | "Government"
                        | "Private",
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="All">
                    All Operators
                  </option>

                  <option value="Government">
                    Government
                  </option>

                  <option value="Private">
                    Private
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timetable entries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>
                  Timetable Entries
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Showing{" "}
                  {filteredTimetables.length} database
                  entries
                </p>
              </div>

              <Badge variant="outline">
                {filteredTimetables.length} Results
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Loading...
                </p>
              </div>
            ) : filteredTimetables.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 font-medium">
                  No timetables found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              filteredTimetables.map((item) => (
                <div
                  key={`${item.id}-${item.departure}-${item.arrival}`}
                  className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {item.service}
                        </h3>

                        {getStatusBadge(
                          item.status,
                        )}
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.operator}
                      </p>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Route
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {item.from} → {item.to}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Time
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {item.departure} →{" "}
                            {item.arrival}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Operating Days
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {item.days}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Bus Type
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {item.busType}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/bus/${item.id}`,
                          )
                        }
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Approved submissions */}
        <Card>
          <CardHeader>
            <CardTitle>
              Approved Submissions
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Approved contributions that are ready to
              be published.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {approvedSubmissions.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 font-medium">
                  No approved submissions waiting for
                  publication
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Approved submissions will appear here.
                </p>
              </div>
            ) : (
              approvedSubmissions.map(
                (submission) => (
                  <div
                    key={submission.id}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {submission.route_name}
                          </h3>

                          <Badge variant="outline">
                            Approved
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {submission.operator_name ??
                            "Operator not specified"}
                        </p>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Route
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {submission.origin_name}{" "}
                              →{" "}
                              {submission.destination_name}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Time
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {formatTime(
                                submission.departure_time,
                              )}{" "}
                              →{" "}
                              {formatTime(
                                submission.arrival_time,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Operating Days
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {formatDays(
                                submission.operating_days,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Bus Type
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {submission.bus_type ??
                                "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/admin/submissions/${submission.id}`,
                            )
                          }
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
                          Review
                        </Button>

                        <Button
                          size="sm"
                          disabled={
                            publishingId ===
                            submission.id
                          }
                          onClick={() =>
                            publishSubmission(
                              submission,
                            )
                          }
                        >
                          <Send className="mr-1.5 h-4 w-4" />

                          {publishingId ===
                          submission.id
                            ? "Publishing..."
                            : "Publish"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ),
              )
            )}
          </CardContent>
        </Card>

        {/* Workflow */}
        <Card>
          <CardHeader>
            <CardTitle>
              Timetable Publishing Workflow
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <Badge variant="outline">
                  1
                </Badge>

                <p className="mt-3 font-medium">
                  Submission
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  User submits timetable information.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <Badge variant="outline">
                  2
                </Badge>

                <p className="mt-3 font-medium">
                  Verification
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Admin checks the submitted
                  information.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <Badge variant="outline">
                  3
                </Badge>

                <p className="mt-3 font-medium">
                  Approval
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Approved information becomes
                  available for publication.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <Badge variant="outline">
                  4
                </Badge>

                <p className="mt-3 font-medium">
                  Publication
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Admin publishes the approved
                  timetable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <p className="pb-4 text-center text-xs text-muted-foreground">
          Kerala Bus Finder · Admin timetable management ·
          Supabase data
        </p>
      </div>
    </main>
  );
}
