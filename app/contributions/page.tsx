"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BusFront,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  MapPin,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { createClient } from "@/lib/supabase/client";

type Status =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected";

type Contribution = {
  id: string;
  from: string;
  to: string;
  service: string;
  submitted: string;
  status: Status;
  note?: string;
};

const statusFilters = [
  "All",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
] as const;

type StatusFilter = (typeof statusFilters)[number];

function getStatusIcon(status: Status) {
  switch (status) {
    case "Pending":
      return <Clock3 className="size-4" />;

    case "Under Review":
      return <Search className="size-4" />;

    case "Approved":
      return <CheckCircle2 className="size-4" />;

    case "Rejected":
      return <AlertCircle className="size-4" />;
  }
}

function getStatusVariant(
  status: Status
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "Pending":
      return "secondary";

    case "Under Review":
      return "outline";

    case "Approved":
      return "default";

    case "Rejected":
      return "destructive";
  }
}

function mapStatus(status: string): Status {
  switch (status) {
    case "pending":
      return "Pending";

    case "under_review":
      return "Under Review";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    default:
      return "Pending";
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ContributionsPage() {
  const supabase = createClient();

  const [activeFilter, setActiveFilter] =
    useState<StatusFilter>("All");

  const [contributions, setContributions] = useState<
    Contribution[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    async function loadContributions() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User lookup error:", userError);
        setErrorMessage(
          "Unable to check your account. Please try again."
        );
        setLoading(false);
        return;
      }

      if (!user) {
        setSignedIn(false);
        setContributions([]);
        setLoading(false);
        return;
      }

      setSignedIn(true);

      const { data, error } = await supabase
        .from("route_submissions")
        .select(`
          id,
          route_name,
          origin_name,
          destination_name,
          status,
          reviewer_note,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Contribution loading error:",
          error
        );

        setErrorMessage(
          "Unable to load your contributions."
        );

        setLoading(false);
        return;
      }

      const mapped: Contribution[] = (data ?? []).map(
        (item) => ({
          id: item.id,
          from: item.origin_name,
          to: item.destination_name,
          service: item.route_name,
          submitted: formatDate(item.created_at),
          status: mapStatus(item.status),
          note: item.reviewer_note ?? undefined,
        })
      );

      setContributions(mapped);
      setLoading(false);
    }

    loadContributions();
  }, []);

  const filteredContributions = useMemo(() => {
    if (activeFilter === "All") {
      return contributions;
    }

    return contributions.filter(
      (item) => item.status === activeFilter
    );
  }, [activeFilter, contributions]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
          <Card className="p-10 text-center">
            <FileText className="mx-auto size-9 text-muted-foreground" />

            <h1 className="mt-4 text-xl font-semibold">
              Loading contributions...
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Checking your submitted timetable information.
            </p>
          </Card>
        </section>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">
                Back
              </span>
            </Button>

            <div className="ml-3 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="size-5" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  My Contributions
                </p>

                <p className="text-xs text-muted-foreground">
                  Your submitted timetables
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
          <Card className="p-10 text-center">
            <FileText className="mx-auto size-10 text-muted-foreground" />

            <h1 className="mt-4 text-2xl font-bold">
              Sign in required
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Please sign in to view your timetable
              contributions.
            </p>

            <Button
              className="mt-6"
              onClick={() =>
                (window.location.href = "/login")
              }
            >
              Sign in
            </Button>
          </Card>
        </section>
      </main>
    );
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
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">
              Back
            </span>
          </Button>

          <div className="ml-3 flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                My Contributions
              </p>

              <p className="text-xs text-muted-foreground">
                Your submitted timetables
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Heading */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">
              Community contributions
            </Badge>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Contributions
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Track the timetable information you have
              submitted and its review status.
            </p>
          </div>

          <Button
            className="w-full gap-2 sm:w-auto"
            onClick={() =>
              (window.location.href = "/add-timetable")
            }
          >
            Add timetable
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />

              <div>
                <p className="text-sm font-medium">
                  Could not load contributions
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status filters */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">
              Filter submissions
            </p>

            <Badge variant="outline">
              {filteredContributions.length}
            </Badge>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {statusFilters.map((filter) => (
              <Button
                key={filter}
                type="button"
                size="sm"
                variant={
                  activeFilter === filter
                    ? "default"
                    : "outline"
                }
                className="shrink-0"
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Contribution list */}
        {filteredContributions.length > 0 && (
          <div className="mt-5 space-y-4">
            {filteredContributions.map(
              (contribution) => (
                <Card
                  key={contribution.id}
                  className="overflow-hidden"
                >
                  <div className="p-5 sm:p-6">
                    {/* Top */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <BusFront className="size-5 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="font-semibold">
                            {contribution.service}
                          </h2>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {contribution.from}
                            </span>

                            <ArrowRight className="size-3.5" />

                            <span>
                              {contribution.to}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={getStatusVariant(
                          contribution.status
                        )}
                        className="w-fit gap-1.5"
                      >
                        {getStatusIcon(
                          contribution.status
                        )}

                        {contribution.status}
                      </Badge>
                    </div>

                    <Separator className="my-5" />

                    {/* Details */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Submitted
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {contribution.submitted}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Route
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                          <MapPin className="size-3.5 text-muted-foreground" />
                          {contribution.from} →{" "}
                          {contribution.to}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">
                          Submission
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {contribution.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    {/* Rejection note */}
                    {contribution.status ===
                      "Rejected" &&
                      contribution.note && (
                        <div className="mt-5 rounded-lg border bg-muted/40 p-4">
                          <div className="flex gap-3">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />

                            <div>
                              <p className="text-sm font-medium">
                                Reviewer note
                              </p>

                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {contribution.note}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Approved note */}
                    {contribution.status ===
                      "Approved" && (
                        <div className="mt-5 rounded-lg border bg-muted/40 p-4">
                          <div className="flex gap-3">
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />

                            <div>
                              <p className="text-sm font-medium">
                                Contribution approved
                              </p>

                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                This contribution has been
                                approved for the publication
                                workflow.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Action */}
                    <div className="mt-5 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 sm:w-auto"
                        disabled
                      >
                        <Eye className="size-4" />
                        View submission
                      </Button>

                      {contribution.status ===
                        "Rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          disabled
                        >
                          Edit & resubmit
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
        )}

        {/* Empty state */}
        {filteredContributions.length === 0 && (
          <Card className="mt-5 p-10 text-center">
            <FileText className="mx-auto size-9 text-muted-foreground" />

            <h2 className="mt-4 font-semibold">
              {contributions.length === 0
                ? "No contributions yet"
                : "No contributions found"}
            </h2>

            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              {contributions.length === 0
                ? "Submit timetable information and it will appear here while it goes through the review process."
                : "There are no submissions matching the selected status."}
            </p>

            {contributions.length === 0 ? (
              <Button
                className="mt-5"
                onClick={() =>
                  (window.location.href =
                    "/add-timetable")
                }
              >
                Add timetable
              </Button>
            ) : (
              <Button
                variant="outline"
                className="mt-5"
                onClick={() =>
                  setActiveFilter("All")
                }
              >
                Show all
              </Button>
            )}
          </Card>
        )}

        {/* Information */}
        <div className="mt-8 text-center">
          <p className="text-xs leading-5 text-muted-foreground">
            Contributions are reviewed before timetable
            information is published. Approval does not
            automatically make unverified information a live
            timetable entry.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          Kerala Bus Finder • Community contributions
        </div>
      </footer>
    </main>
  );
}