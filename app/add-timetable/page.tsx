"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BusFront,
  Check,
  Clock3,
  FileText,
  Info,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { createClient } from "@/lib/supabase/client";

type Stop = {
  id: number;
  name: string;
  time: string;
};

const initialStops: Stop[] = [
  {
    id: 1,
    name: "Kottayam",
    time: "06:30",
  },
  {
    id: 2,
    name: "Pala",
    time: "07:30",
  },
];

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AddTimetablePage() {
  const router = useRouter();
  const supabase = createClient();

  const [operatorType, setOperatorType] =
    useState("Government");

  const [stops, setStops] =
    useState<Stop[]>(initialStops);

  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function addStop() {
    setStops((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        time: "",
      },
    ]);
  }

  function removeStop(id: number) {
    if (stops.length <= 2) return;

    setStops((current) =>
      current.filter((stop) => stop.id !== id)
    );
  }

  function updateStop(
    id: number,
    field: keyof Stop,
    value: string
  ) {
    setStops((current) =>
      current.map((stop) =>
        stop.id === id
          ? {
              ...stop,
              [field]: value,
            }
          : stop
      )
    );
  }

  function toggleDay(day: string) {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSubmitted(false);

    const formData = new FormData(event.currentTarget);

    const from = String(formData.get("from") ?? "").trim();
    const to = String(formData.get("to") ?? "").trim();

    const serviceName = String(
      formData.get("service-name") ?? ""
    ).trim();

    const operatorName = String(
      formData.get("operator") ?? ""
    ).trim();

    const busType = String(
      formData.get("bus-type") ?? ""
    ).trim();

    const departureTime = String(
      formData.get("departure") ?? ""
    ).trim();

    const arrivalTime = String(
      formData.get("arrival") ?? ""
    ).trim();

    const sourceUrl = String(
      formData.get("source") ?? ""
    ).trim();

    const additionalNotes = String(
      formData.get("notes") ?? ""
    ).trim();

    try {
      // --------------------------------------------------
      // 1. Check authentication
      // --------------------------------------------------
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          "Unable to verify your account. Please try again."
        );
      }

      if (!user) {
        router.push("/login");
        return;
      }

      // --------------------------------------------------
      // 2. Validate route
      // --------------------------------------------------
      if (!from || !to) {
        throw new Error(
          "Please enter both the starting point and destination."
        );
      }

      if (!serviceName) {
        throw new Error(
          "Please enter a service name."
        );
      }

      if (!operatorName) {
        throw new Error(
          "Please enter the operator name."
        );
      }

      if (selectedDays.length === 0) {
        throw new Error(
          "Please select at least one operating day."
        );
      }

      // --------------------------------------------------
      // 3. Convert selected days to database text
      // --------------------------------------------------
      const operatingDays =
        selectedDays.join(", ");

      // --------------------------------------------------
      // 4. Preserve submitted stop information in notes
      //
      // route_submissions currently has no stops column.
      // Therefore these are NOT inserted into service_stops.
      // They remain reviewer information until approved.
      // --------------------------------------------------
      const validStops = stops.filter(
        (stop) => stop.name.trim() || stop.time.trim()
      );

      const stopDetails =
        validStops.length > 0
          ? [
              "",
              "Submitted stop details for reviewer:",
              ...validStops.map((stop, index) => {
                const stopName =
                  stop.name.trim() || "(unnamed stop)";

                const stopTime =
                  stop.time.trim() || "(time not provided)";

                return `${index + 1}. ${stopName} — ${stopTime}`;
              }),
            ].join("\n")
          : "";

      const combinedNotes = [
        additionalNotes,
        stopDetails,
      ]
        .filter(Boolean)
        .join("\n");

      // --------------------------------------------------
      // 5. Create pending submission
      // --------------------------------------------------
      const { error: insertError } = await supabase
        .from("route_submissions")
        .insert({
          user_id: user.id,
          route_name: serviceName,
          operator_name: operatorName,
          operator_type: operatorType,
          origin_name: from,
          destination_name: to,
          bus_type: busType || null,
          departure_time:
            departureTime || null,
          arrival_time:
            arrivalTime || null,
          operating_days: operatingDays,
          notes: combinedNotes || null,
          source_url: sourceUrl || null,
          status: "pending",
        });

      if (insertError) {
        console.error(
          "Submission insert error:",
          insertError
        );

        throw new Error(
          "Could not save your submission. Please try again."
        );
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-4" />

            <span className="hidden sm:inline">
              Back
            </span>
          </Button>

          <div className="ml-3 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BusFront className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Add Timetable
              </p>

              <p className="text-xs text-muted-foreground">
                Submit a bus service
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Heading */}
        <div>
          <Badge variant="secondary" className="mb-3">
            Community contribution
          </Badge>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Submit a bus timetable
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Help improve Kerala Bus Finder by submitting
            route and timetable information.
          </p>
        </div>

        {/* Review notice */}
        <div className="mt-6 rounded-xl border bg-muted/40 p-4">
          <div className="flex gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium">
                Your submission will be reviewed
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Submitted timetable information will not
                be published immediately. An administrator
                will review, edit if necessary, and approve
                the information before it becomes part of
                the public timetable.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />

              <div>
                <p className="text-sm font-medium">
                  Submission failed
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6"
        >
          {/* Route */}
          <Card className="p-5 sm:p-7">
            <div>
              <h2 className="font-semibold">
                Route information
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Tell us where this service operates.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="from"
                  className="mb-2 block text-sm font-medium"
                >
                  From
                </label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="from"
                    name="from"
                    placeholder="Starting point"
                    className="h-11 pl-10"
                    defaultValue="Kottayam"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="to"
                  className="mb-2 block text-sm font-medium"
                >
                  To
                </label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="to"
                    name="to"
                    placeholder="Destination"
                    className="h-11 pl-10"
                    defaultValue="Pala"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Operator */}
          <Card className="p-5 sm:p-7">
            <div>
              <h2 className="font-semibold">
                Service information
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Provide the available information about the
                bus service.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="service-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Service name
                </label>

                <Input
                  id="service-name"
                  name="service-name"
                  placeholder="Example: Morning service"
                  className="h-11"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="operator"
                  className="mb-2 block text-sm font-medium"
                >
                  Operator name
                </label>

                <Input
                  id="operator"
                  name="operator"
                  placeholder="Enter operator name"
                  className="h-11"
                  required
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">
                  Operator type
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={
                      operatorType === "Government"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setOperatorType("Government")
                    }
                  >
                    Government
                  </Button>

                  <Button
                    type="button"
                    variant={
                      operatorType === "Private"
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setOperatorType("Private")
                    }
                  >
                    Private
                  </Button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="bus-type"
                  className="mb-2 block text-sm font-medium"
                >
                  Bus type
                </label>

                <Input
                  id="bus-type"
                  name="bus-type"
                  placeholder="Example: Ordinary"
                  className="h-11"
                />
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-5 sm:p-7">
            <div>
              <h2 className="font-semibold">
                Schedule
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Add the days and times when this service
                operates.
              </p>
            </div>

            {/* Days */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">
                Operating days
              </p>

              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => {
                  const selected =
                    selectedDays.includes(day);

                  return (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={
                        selected ? "default" : "outline"
                      }
                      onClick={() => toggleDay(day)}
                    >
                      {selected && (
                        <Check className="mr-1 size-3.5" />
                      )}

                      {day.slice(0, 3)}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Departure / arrival */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="departure"
                  className="mb-2 block text-sm font-medium"
                >
                  Departure time
                </label>

                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="departure"
                    name="departure"
                    type="time"
                    className="h-11 pl-10"
                    defaultValue="06:30"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="arrival"
                  className="mb-2 block text-sm font-medium"
                >
                  Arrival time
                </label>

                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="arrival"
                    name="arrival"
                    type="time"
                    className="h-11 pl-10"
                    defaultValue="07:30"
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Stops */}
          <Card className="p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">
                  Stops and timings
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Add the stops you know for this service.
                  These will be sent to the reviewer and
                  will not be published automatically.
                </p>
              </div>

              <Badge variant="outline">
                {stops.length} stops
              </Badge>
            </div>

            <div className="mt-6 space-y-3">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="rounded-xl border p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>

                      <span className="text-sm font-medium">
                        Stop {index + 1}
                      </span>
                    </div>

                    {stops.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeStop(stop.id)
                        }
                        aria-label={`Remove stop ${
                          index + 1
                        }`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
                    <Input
                      placeholder="Stop name"
                      value={stop.name}
                      onChange={(event) =>
                        updateStop(
                          stop.id,
                          "name",
                          event.target.value
                        )
                      }
                      required
                    />

                    <Input
                      type="time"
                      value={stop.time}
                      onChange={(event) =>
                        updateStop(
                          stop.id,
                          "time",
                          event.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full gap-2"
              onClick={addStop}
            >
              <Plus className="size-4" />
              Add another stop
            </Button>
          </Card>

          {/* Evidence */}
          <Card className="p-5 sm:p-7">
            <div>
              <h2 className="font-semibold">
                Source or evidence
              </h2>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                If you have a timetable, photo, official
                source or other information that can help
                verify this submission, provide it here.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="source"
                  className="mb-2 block text-sm font-medium"
                >
                  Source / reference
                </label>

                <Input
                  id="source"
                  name="source"
                  placeholder="Enter source or reference URL"
                  className="h-11"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-medium"
                >
                  Additional notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Anything else the reviewer should know..."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="rounded-lg border border-dashed p-5 text-center">
                <FileText className="mx-auto size-7 text-muted-foreground" />

                <p className="mt-2 text-sm font-medium">
                  Evidence upload
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  File upload will be connected later.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled
                >
                  Choose file
                </Button>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <Card className="p-5 sm:p-7">
            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Info className="size-5 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-medium">
                  Before submitting
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Please provide information as accurately
                  as possible. Your submission will be
                  reviewed before it is published.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-6 w-full gap-2"
              disabled={loading || submitted}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : submitted ? (
                <>
                  <Check className="size-4" />
                  Submitted
                </>
              ) : (
                <>
                  Submit for review
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            {submitted && (
              <div className="mt-4 rounded-lg border bg-muted/40 p-4">
                <div className="flex gap-3">
                  <Check className="mt-0.5 size-5 shrink-0" />

                  <div>
                    <p className="text-sm font-medium">
                      Submission sent for review
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Your timetable has been saved as a
                      pending contribution. An administrator
                      must review it before publication.
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() =>
                        router.push("/contributions")
                      }
                    >
                      View my contributions
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-3xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          Kerala Bus Finder • Community timetable contributions
        </div>
      </footer>
    </main>
  );
}