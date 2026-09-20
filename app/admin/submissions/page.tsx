"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BusFront,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { createClient } from "@/lib/supabase/client";

type SubmissionStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected";

type Submission = {
  id: string;
  service: string;
  route: string;
  operator: string;
  submittedBy: string;
  submitted: string;
  status: SubmissionStatus;
};

const filters = [
  "All",
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
] as const;

type Filter = (typeof filters)[number];

function mapStatus(status: string): SubmissionStatus {
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

function statusIcon(status: SubmissionStatus) {
  switch (status) {
    case "Pending":
      return <Clock3 className="size-3.5" />;

    case "Under Review":
      return <Search className="size-3.5" />;

    case "Approved":
      return <CheckCircle2 className="size-3.5" />;

    case "Rejected":
      return <XCircle className="size-3.5" />;

    default:
      return null;
  }
}

function statusVariant(
  status: SubmissionStatus,
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

    default:
      return "secondary";
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

export default function AdminSubmissionsPage() {
  const supabase = createClient();

  const [activeFilter, setActiveFilter] =
    useState<Filter>("All");

  const [search, setSearch] = useState("");

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [accessDenied, setAccessDenied] =
    useState(false);

  useEffect(() => {
    async function loadSubmissions() {
      setLoading(true);
      setErrorMessage("");
      setAccessDenied(false);

      // --------------------------------------------------
      // 1. Check authentication
      // --------------------------------------------------
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Authentication error:",
          userError,
        );

        setErrorMessage(
          "Unable to verify your account.",
        );

        setLoading(false);
        return;
      }

      if (!user) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // --------------------------------------------------
      // 2. Load submissions
      //
      // RLS/admin policies on route_submissions are
      // responsible for determining whether this user
      // can read the records.
      // --------------------------------------------------
      const { data, error } = await supabase
        .from("route_submissions")
        .select(`
          id,
          route_name,
          operator_name,
          origin_name,
          destination_name,
          user_id,
          status,
          created_at
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Admin submissions loading error:",
          error,
        );

        if (
          error.code === "42501" ||
          error.message
            .toLowerCase()
            .includes("permission")
        ) {
          setAccessDenied(true);
        } else {
          setErrorMessage(
            "Unable to load timetable submissions.",
          );
        }

        setLoading(false);
        return;
      }

      const mapped: Submission[] = (data ?? []).map(
        (item) => ({
          id: item.id,
          service: item.route_name,
          route: `${item.origin_name} → ${item.destination_name}`,
          operator:
            item.operator_name || "Not provided",
          submittedBy: item.user_id,
          submitted: formatDate(item.created_at),
          status: mapStatus(item.status),
        }),
      );

      setSubmissions(mapped);
      setLoading(false);
    }

    loadSubmissions();
  }, []);

  const filteredSubmissions = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return submissions.filter((submission) => {
      const matchesFilter =
        activeFilter === "All" ||
        submission.status === activeFilter;

      const matchesSearch =
        !searchText ||
        submission.service
          .toLowerCase()
          .includes(searchText) ||
        submission.route
          .toLowerCase()
          .includes(searchText) ||
        submission.operator
          .toLowerCase()
          .includes(searchText) ||
        submission.submittedBy
          .toLowerCase()
          .includes(searchText) ||
        submission.id
          .toLowerCase()
          .includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [
    activeFilter,
    search,
    submissions,
  ]);

  const goTo = (path: string) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="flex min-h-screen items-center justify-center p-6">
          <Card className="w-full max-w-md p-8 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />

            <h1 className="mt-4 text-lg font-semibold">
              Loading submissions...
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Checking administrator access and loading
              community submissions.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="flex min-h-screen items-center justify-center p-6">
          <Card className="w-full max-w-md p-8 text-center">
            <ShieldCheck className="mx-auto size-10 text-muted-foreground" />

            <h1 className="mt-4 text-xl font-semibold">
              Admin access required
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You need an authenticated administrator
              account to view timetable submissions.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                variant="outline"
                onClick={() =>
                  goTo("/admin")
                }
              >
                Back to admin
              </Button>

              <Button
                onClick={() =>
                  goTo("/login")
                }
              >
                Sign in
              </Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-muted/30">
        <div className="flex min-h-screen items-center justify-center p-6">
          <Card className="w-full max-w-md p-8 text-center">
            <AlertCircle className="mx-auto size-10 text-destructive" />

            <h1 className="mt-4 text-xl font-semibold">
              Could not load submissions
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {errorMessage}
            </p>

            <Button
              className="mt-6"
              onClick={() =>
                window.location.reload()
              }
            >
              Try again
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="border-b bg-background lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="sticky top-0">
            <div className="flex h-16 items-center gap-3 border-b px-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BusFront className="size-5" />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Kerala Bus Finder
                </p>

                <p className="text-xs text-muted-foreground">
                  Administration
                </p>
              </div>
            </div>

            <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">
              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() =>
                  goTo("/admin")
                }
              >
                <FileText className="size-4" />
                Dashboard
              </Button>

              <Button
                variant="secondary"
                className="shrink-0 justify-start gap-3 lg:w-full"
              >
                <FileCheck2 className="size-4" />
                Submissions

                <Badge
                  variant="secondary"
                  className="ml-auto hidden lg:inline-flex"
                >
                  {submissions.filter(
                    (item) =>
                      item.status === "Pending",
                  ).length}
                </Badge>
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() =>
                  goTo("/admin/timetables")
                }
              >
                <BusFront className="size-4" />
                Timetables
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() =>
                  goTo("/admin/users")
                }
              >
                <ShieldCheck className="size-4" />
                Users
              </Button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    goTo("/admin")
                  }
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="size-4" />
                </Button>

                <div>
                  <p className="text-sm font-semibold">
                    Submissions
                  </p>

                  <p className="hidden text-xs text-muted-foreground sm:block">
                    Review community timetable submissions
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="gap-1.5"
              >
                <ShieldCheck className="size-3.5" />
                Admin
              </Badge>
            </div>
          </header>

          <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Heading */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Timetable submissions
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Review, edit and approve information
                submitted by users.
              </p>
            </div>

            {/* Backend notice */}
            <div className="mt-6 rounded-xl border bg-muted/40 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                <div>
                  <p className="text-sm font-medium">
                    Live submission data
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    These records are loaded directly
                    from the route_submissions table.
                    Review actions will be connected in
                    the next step.
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <Card className="mt-6 p-4 sm:p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by route, service, operator or submission ID..."
                  className="h-11 pl-10"
                />
              </div>
            </Card>

            {/* Filters */}
            <div className="mt-5">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={
                      activeFilter === filter
                        ? "default"
                        : "outline"
                    }
                    className="shrink-0"
                    onClick={() =>
                      setActiveFilter(filter)
                    }
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            {/* Result count */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Submissions
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {filteredSubmissions.length} matching
                  submissions
                </p>
              </div>

              <Badge variant="secondary">
                {filteredSubmissions.length}
              </Badge>
            </div>

            {/* Submission list */}
            <div className="mt-4 space-y-3">
              {filteredSubmissions.map(
                (submission) => (
                  <Card
                    key={submission.id}
                    className="overflow-hidden"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        {/* Information */}
                        <div className="flex min-w-0 gap-4">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <FileText className="size-5 text-muted-foreground" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="font-semibold">
                                {submission.service}
                              </h2>

                              <Badge
                                variant={statusVariant(
                                  submission.status,
                                )}
                                className="gap-1.5"
                              >
                                {statusIcon(
                                  submission.status,
                                )}

                                {submission.status}
                              </Badge>
                            </div>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {submission.route}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <span>
                                Operator:{" "}
                                {submission.operator}
                              </span>

                              <span className="max-w-full truncate">
                                Submitted by:{" "}
                                {submission.submittedBy}
                              </span>

                              <span className="max-w-full truncate">
                                ID:{" "}
                                {submission.id}
                              </span>

                              <span>
                                {submission.submitted}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <Button
                          className="w-full gap-2 lg:w-auto"
                          variant={
                            submission.status ===
                              "Pending" ||
                            submission.status ===
                              "Under Review"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            goTo(
                              `/admin/submissions/${submission.id}`,
                            )
                          }
                        >
                          Review submission
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>

                      {/* Status explanation */}
                      {submission.status ===
                        "Pending" && (
                        <>
                          <Separator className="my-4" />

                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 className="size-3.5" />

                            Waiting for an
                            administrator to review
                            this submission.
                          </p>
                        </>
                      )}

                      {submission.status ===
                        "Under Review" && (
                        <>
                          <Separator className="my-4" />

                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Search className="size-3.5" />

                            An administrator is
                            currently reviewing this
                            submission.
                          </p>
                        </>
                      )}

                      {submission.status ===
                        "Approved" && (
                        <>
                          <Separator className="my-4" />

                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="size-3.5" />

                            This submission has been
                            approved.
                          </p>
                        </>
                      )}

                      {submission.status ===
                        "Rejected" && (
                        <>
                          <Separator className="my-4" />

                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <XCircle className="size-3.5" />

                            This submission was
                            rejected and requires
                            correction before
                            resubmission.
                          </p>
                        </>
                      )}
                    </div>
                  </Card>
                ),
              )}
            </div>

            {/* Empty state */}
            {filteredSubmissions.length === 0 && (
              <Card className="mt-4 p-10 text-center">
                <FileText className="mx-auto size-9 text-muted-foreground" />

                <h2 className="mt-4 font-semibold">
                  No submissions found
                </h2>

                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Try changing the status filter or
                  search term.
                </p>

                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setActiveFilter("All");
                    setSearch("");
                  }}
                >
                  Clear filters
                </Button>
              </Card>
            )}

            {/* Workflow */}
            <Card className="mt-8 p-5 sm:p-6">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

                <div>
                  <p className="text-sm font-semibold">
                    Review workflow
                  </p>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    User submission → Pending → Admin
                    review → Edit/verify → Approve or
                    Reject → Approved timetable can be
                    published.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}