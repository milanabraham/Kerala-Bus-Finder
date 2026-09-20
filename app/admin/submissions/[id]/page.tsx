"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  Save,
  Search,
  ShieldCheck,
  X,
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

type ReviewStatus =
  | "Pending"
  | "Under Review"
  | "Approved"
  | "Rejected";

type Submission = {
  id: string;
  user_id: string;
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
  reviewer_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type Review = {
  id: string;
  reviewer_id: string;
  action: string;
  note: string | null;
  created_at: string;
};

function mapStatus(status: string): ReviewStatus {
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

function formatDate(dateString: string | null) {
  if (!dateString) return "—";

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

function formatDateTime(dateString: string | null) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatTime(time: string | null) {
  if (!time) return "";

  return time.slice(0, 5);
}

function statusBadge(status: ReviewStatus) {
  switch (status) {
    case "Pending":
      return (
        <Badge variant="secondary">
          <Clock3 className="mr-1 h-3.5 w-3.5" />
          Pending
        </Badge>
      );

    case "Under Review":
      return (
        <Badge variant="outline">
          <Search className="mr-1 h-3.5 w-3.5" />
          Under Review
        </Badge>
      );

    case "Approved":
      return (
        <Badge>
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Approved
        </Badge>
      );

    case "Rejected":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3.5 w-3.5" />
          Rejected
        </Badge>
      );
  }
}

export default function AdminSubmissionReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const submissionId = params?.id;

  const supabase = createClient();

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [serviceName, setServiceName] =
    useState("");

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  const [operator, setOperator] =
    useState("");

  const [operatorType, setOperatorType] =
    useState("");

  const [busType, setBusType] =
    useState("");

  const [departure, setDeparture] =
    useState("");

  const [arrival, setArrival] =
    useState("");

  const [operatingDays, setOperatingDays] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [sourceUrl, setSourceUrl] =
    useState("");

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [showRejectBox, setShowRejectBox] =
    useState(false);

  async function loadSubmission() {
    if (!submissionId) {
      setErrorMessage(
        "No submission ID was provided.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "You must be signed in as an administrator.",
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("route_submissions")
      .select(`
        id,
        user_id,
        route_name,
        operator_name,
        operator_type,
        origin_name,
        destination_name,
        bus_type,
        departure_time,
        arrival_time,
        operating_days,
        notes,
        source_url,
        status,
        reviewer_note,
        reviewed_by,
        reviewed_at,
        created_at,
        updated_at
      `)
      .eq("id", submissionId)
      .single();

    if (error) {
      console.error(
        "Submission loading error:",
        error,
      );

      setErrorMessage(
        "Unable to load this submission. You may not have permission to view it.",
      );

      setLoading(false);
      return;
    }

    const submissionData =
      data as Submission;

    setSubmission(submissionData);

    setServiceName(
      submissionData.route_name,
    );

    setFrom(
      submissionData.origin_name,
    );

    setTo(
      submissionData.destination_name,
    );

    setOperator(
      submissionData.operator_name ?? "",
    );

    setOperatorType(
      submissionData.operator_type ?? "",
    );

    setBusType(
      submissionData.bus_type ?? "",
    );

    setDeparture(
      formatTime(
        submissionData.departure_time,
      ),
    );

    setArrival(
      formatTime(
        submissionData.arrival_time,
      ),
    );

    setOperatingDays(
      submissionData.operating_days ?? "",
    );

    setNotes(
      submissionData.notes ?? "",
    );

    setSourceUrl(
      submissionData.source_url ?? "",
    );

    setRejectionReason(
      submissionData.reviewer_note ?? "",
    );

    // Load review history
    const {
      data: reviewData,
      error: reviewError,
    } = await supabase
      .from("submission_reviews")
      .select(`
        id,
        reviewer_id,
        action,
        note,
        created_at
      `)
      .eq(
        "submission_id",
        submissionId,
      )
      .order("created_at", {
        ascending: true,
      });

    if (reviewError) {
      console.error(
        "Review history loading error:",
        reviewError,
      );

      // Don't fail the whole page if the
      // history cannot be loaded.
      setReviews([]);
    } else {
      setReviews(
        (reviewData ?? []) as Review[],
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  async function updateSubmission(
    changes: Record<string, unknown>,
  ) {
    if (!submission) return false;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );
      return false;
    }

    const { data, error } = await supabase
      .from("route_submissions")
      .update({
        ...changes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submission.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Submission update error:",
        error,
      );

      setErrorMessage(
        "Could not update the submission. Check administrator permissions.",
      );

      return false;
    }

    setSubmission(data as Submission);

    return true;
  }

  async function handleSaveEdits() {
    if (!submission) return;

    setSaving(true);
    setErrorMessage("");
    setMessage("");

    const success = await updateSubmission({
      route_name: serviceName.trim(),
      origin_name: from.trim(),
      destination_name: to.trim(),
      operator_name:
        operator.trim() || null,
      operator_type:
        operatorType.trim() || null,
      bus_type:
        busType.trim() || null,
      departure_time:
        departure.trim() || null,
      arrival_time:
        arrival.trim() || null,
      operating_days:
        operatingDays.trim() || null,
      notes:
        notes.trim() || null,
      source_url:
        sourceUrl.trim() || null,
    });

    if (success) {
      setMessage(
        "Submission changes saved.",
      );
    }

    setSaving(false);
  }

  async function handleStartReview() {
    if (!submission) return;

    if (
      submission.status !== "pending"
    ) {
      return;
    }

    setActionLoading(true);
    setErrorMessage("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );
      setActionLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("route_submissions")
      .update({
        status: "under_review",
        reviewed_by: user.id,
        reviewed_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", submission.id)
      .eq("status", "pending")
      .select()
      .single();

    if (error) {
      console.error(
        "Start review error:",
        error,
      );

      setErrorMessage(
        "Could not move this submission into review.",
      );

      setActionLoading(false);
      return;
    }

    const { error: reviewError } =
      await supabase
        .from("submission_reviews")
        .insert({
          submission_id:
            submission.id,
          reviewer_id: user.id,
          action: "under_review",
          note: null,
        });

    if (reviewError) {
      console.error(
        "Review history error:",
        reviewError,
      );

      // The main status was changed successfully.
      // Inform the admin about the history issue.
      setMessage(
        "Submission moved to Under Review, but the review history could not be recorded.",
      );
    } else {
      setMessage(
        "Submission is now Under Review.",
      );
    }

    setSubmission(data as Submission);

    await loadSubmission();

    setActionLoading(false);
  }

  async function handleApprove() {
    if (!submission) return;

    setActionLoading(true);
    setErrorMessage("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );
      setActionLoading(false);
      return;
    }

    // Save any edits before approving.
    const saved = await updateSubmission({
      route_name: serviceName.trim(),
      origin_name: from.trim(),
      destination_name: to.trim(),
      operator_name:
        operator.trim() || null,
      operator_type:
        operatorType.trim() || null,
      bus_type:
        busType.trim() || null,
      departure_time:
        departure.trim() || null,
      arrival_time:
        arrival.trim() || null,
      operating_days:
        operatingDays.trim() || null,
      notes:
        notes.trim() || null,
      source_url:
        sourceUrl.trim() || null,
      status: "approved",
      reviewer_note: null,
      reviewed_by: user.id,
      reviewed_at:
        new Date().toISOString(),
    });

    if (!saved) {
      setActionLoading(false);
      return;
    }

    const { error: reviewError } =
      await supabase
        .from("submission_reviews")
        .insert({
          submission_id:
            submission.id,
          reviewer_id: user.id,
          action: "approved",
          note: null,
        });

    if (reviewError) {
      console.error(
        "Approval review history error:",
        reviewError,
      );

      setMessage(
        "Submission approved, but the review history could not be recorded.",
      );
    } else {
      setMessage(
        "Submission approved successfully.",
      );
    }

    await loadSubmission();

    setShowRejectBox(false);
    setActionLoading(false);
  }

  async function handleReject() {
    if (!submission) return;

    if (!rejectionReason.trim()) {
      setMessage(
        "Please enter a reason before rejecting the submission.",
      );
      return;
    }

    setActionLoading(true);
    setErrorMessage("");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage(
        "Your session has expired. Please sign in again.",
      );
      setActionLoading(false);
      return;
    }

    const note =
      rejectionReason.trim();

    const saved = await updateSubmission({
      status: "rejected",
      reviewer_note: note,
      reviewed_by: user.id,
      reviewed_at:
        new Date().toISOString(),
    });

    if (!saved) {
      setActionLoading(false);
      return;
    }

    const { error: reviewError } =
      await supabase
        .from("submission_reviews")
        .insert({
          submission_id:
            submission.id,
          reviewer_id: user.id,
          action: "rejected",
          note,
        });

    if (reviewError) {
      console.error(
        "Rejection review history error:",
        reviewError,
      );

      setMessage(
        "Submission rejected, but the review history could not be recorded.",
      );
    } else {
      setMessage(
        "Submission rejected successfully.",
      );
    }

    await loadSubmission();

    setShowRejectBox(false);
    setActionLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center p-6">
          <Card className="w-full max-w-md p-8 text-center">
            <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />

            <h1 className="mt-4 text-lg font-semibold">
              Loading submission...
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Retrieving submission details and
              review history.
            </p>
          </Card>
        </div>
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center p-6">
          <Card className="w-full max-w-md p-8 text-center">
            <XCircle className="mx-auto size-10 text-destructive" />

            <h1 className="mt-4 text-xl font-semibold">
              Submission not found
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {errorMessage ||
                "The requested submission could not be loaded."}
            </p>

            <Button
              className="mt-6"
              onClick={() =>
                router.push(
                  "/admin/submissions",
                )
              }
            >
              Back to submissions
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const reviewStatus =
    mapStatus(submission.status);

  const isDecisionComplete =
    reviewStatus === "Approved" ||
    reviewStatus === "Rejected";

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
                router.push(
                  "/admin/submissions",
                )
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">
                  Review Submission
                </h1>

                <Badge variant="secondary">
                  {submission.id.slice(
                    0,
                    8,
                  )}
                </Badge>

                {statusBadge(
                  reviewStatus,
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Verify, edit and review submitted
                timetable information.
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="hidden sm:flex"
          >
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            Admin Review
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Backend notice */}
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

            <div>
              <p className="font-medium">
                Live admin review
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Changes made here are saved to the
                database. Approval and rejection are
                recorded in the submission review
                history.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Submission
              </p>

              <p className="mt-1 font-semibold break-all">
                {submission.id}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Review Status
              </p>

              <div className="mt-2">
                {statusBadge(
                  reviewStatus,
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Submitted
              </p>

              <p className="mt-1 font-semibold">
                {formatDate(
                  submission.created_at,
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Submitted By
              </p>

              <p className="mt-1 break-all text-sm font-semibold">
                {submission.user_id}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main review area */}
          <div className="space-y-6 lg:col-span-2">
            {/* Route */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Route & Service Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="from"
                      className="text-sm font-medium"
                    >
                      From
                    </label>

                    <Input
                      id="from"
                      value={from}
                      onChange={(e) =>
                        setFrom(
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="to"
                      className="text-sm font-medium"
                    >
                      To
                    </label>

                    <Input
                      id="to"
                      value={to}
                      onChange={(e) =>
                        setTo(
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="serviceName"
                    className="text-sm font-medium"
                  >
                    Service Name
                  </label>

                  <Input
                    id="serviceName"
                    value={serviceName}
                    onChange={(e) =>
                      setServiceName(
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="operator"
                      className="text-sm font-medium"
                    >
                      Operator
                    </label>

                    <Input
                      id="operator"
                      value={operator}
                      onChange={(e) =>
                        setOperator(
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="operatorType"
                      className="text-sm font-medium"
                    >
                      Operator Type
                    </label>

                    <select
                      id="operatorType"
                      value={operatorType}
                      onChange={(e) =>
                        setOperatorType(
                          e.target.value,
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">
                        Unknown
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

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="busType"
                      className="text-sm font-medium"
                    >
                      Bus Type
                    </label>

                    <Input
                      id="busType"
                      value={busType}
                      onChange={(e) =>
                        setBusType(
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="departure"
                      className="text-sm font-medium"
                    >
                      Departure
                    </label>

                    <Input
                      id="departure"
                      type="time"
                      value={departure}
                      onChange={(e) =>
                        setDeparture(
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="arrival"
                      className="text-sm font-medium"
                    >
                      Arrival
                    </label>

                    <Input
                      id="arrival"
                      type="time"
                      value={arrival}
                      onChange={(e) =>
                        setArrival(
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="operatingDays"
                    className="text-sm font-medium"
                  >
                    Operating Days
                  </label>

                  <Input
                    id="operatingDays"
                    value={operatingDays}
                    onChange={(e) =>
                      setOperatingDays(
                        e.target.value,
                      )
                    }
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={
                      handleSaveEdits
                    }
                    disabled={
                      saving ||
                      actionLoading
                    }
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}

                    {saving
                      ? "Saving..."
                      : "Save Edits"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Notes & Source
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="sourceUrl"
                    className="text-sm font-medium"
                  >
                    Source / Reference
                  </label>

                  <Input
                    id="sourceUrl"
                    value={sourceUrl}
                    onChange={(e) =>
                      setSourceUrl(
                        e.target.value,
                      )
                    }
                    placeholder="User-provided source"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="notes"
                    className="text-sm font-medium"
                  >
                    Additional Notes
                  </label>

                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) =>
                      setNotes(
                        e.target.value,
                      )
                    }
                    rows={8}
                    className="w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submitted stops */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Submitted Route Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        1. {from}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Departure:{" "}
                        {departure ||
                          "Not provided"}
                      </p>
                    </div>

                    <Badge variant="outline">
                      Origin
                    </Badge>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        2. {to}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Arrival:{" "}
                        {arrival ||
                          "Not provided"}
                      </p>
                    </div>

                    <Badge variant="outline">
                      Destination
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Intermediate stop information is
                  preserved in the submission notes and
                  should only become structured timetable
                  data after verification.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Review sidebar */}
          <div className="space-y-6">
            {/* Submission details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Submission Details
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Submitted by
                  </p>

                  <p className="mt-1 break-all text-sm font-medium">
                    {submission.user_id}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground">
                    Submitted on
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDateTime(
                      submission.created_at,
                    )}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-xs text-muted-foreground">
                    Current state
                  </p>

                  <div className="mt-2">
                    {statusBadge(
                      reviewStatus,
                    )}
                  </div>
                </div>

                {submission.reviewed_at && (
                  <>
                    <Separator />

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last reviewed
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {formatDateTime(
                          submission.reviewed_at,
                        )}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Decision */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Review Decision
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {reviewStatus ===
                  "Pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={
                        handleStartReview
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}

                      Start Review
                    </Button>

                    <Button
                      className="w-full"
                      onClick={
                        handleApprove
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}

                      Approve Submission
                    </Button>

                    {!showRejectBox ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          setShowRejectBox(
                            true,
                          )
                        }
                        disabled={
                          actionLoading
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject Submission
                      </Button>
                    ) : (
                      <div className="space-y-3 rounded-lg border p-4">
                        <div>
                          <p className="text-sm font-medium">
                            Rejection Reason
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Explain what needs to be
                            corrected.
                          </p>
                        </div>

                        <textarea
                          value={
                            rejectionReason
                          }
                          onChange={(e) =>
                            setRejectionReason(
                              e.target.value,
                            )
                          }
                          placeholder="Enter rejection reason..."
                          className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />

                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={
                              handleReject
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            {actionLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}

                            Confirm Reject
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() =>
                              setShowRejectBox(
                                false,
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {reviewStatus ===
                  "Under Review" && (
                  <>
                    <div className="rounded-lg border bg-muted/40 p-4">
                      <div className="flex gap-2">
                        <Search className="h-5 w-5 shrink-0" />

                        <div>
                          <p className="font-medium">
                            Submission Under Review
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Verify the submitted information,
                            make any necessary edits, then
                            approve or reject it.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={
                        handleApprove
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}

                      Approve Submission
                    </Button>

                    {!showRejectBox ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          setShowRejectBox(
                            true,
                          )
                        }
                        disabled={
                          actionLoading
                        }
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject Submission
                      </Button>
                    ) : (
                      <div className="space-y-3 rounded-lg border p-4">
                        <div>
                          <p className="text-sm font-medium">
                            Rejection Reason
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Explain what needs to be
                            corrected.
                          </p>
                        </div>

                        <textarea
                          value={
                            rejectionReason
                          }
                          onChange={(e) =>
                            setRejectionReason(
                              e.target.value,
                            )
                          }
                          placeholder="Enter rejection reason..."
                          className="min-h-28 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />

                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={
                              handleReject
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            {actionLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}

                            Confirm Reject
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() =>
                              setShowRejectBox(
                                false,
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {reviewStatus ===
                  "Approved" && (
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <div className="flex gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />

                      <div>
                        <p className="font-medium">
                          Submission Approved
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          This submission has been
                          approved. Publishing to the
                          public timetable is a separate
                          workflow and is not performed
                          here yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {reviewStatus ===
                  "Rejected" && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                      <div className="flex gap-2">
                        <XCircle className="h-5 w-5 shrink-0 text-destructive" />

                        <div>
                          <p className="font-medium">
                            Submission Rejected
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {submission.reviewer_note ||
                              "No reviewer note provided."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review history */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Review History
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-muted-foreground" />

                  <div>
                    <p className="text-sm font-medium">
                      Submission received
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(
                        submission.created_at,
                      )}
                    </p>
                  </div>
                </div>

                {reviews.map(
                  (review) => (
                    <div
                      key={review.id}
                      className="flex gap-3"
                    >
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />

                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {review.action
                            .replace(
                              /_/g,
                              " ",
                            )
                            .replace(
                              /\b\w/g,
                              (letter) =>
                                letter.toUpperCase(),
                            )}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(
                            review.created_at,
                          )}
                        </p>

                        {review.note && (
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {review.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message */}
        {message && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />

              <p className="text-sm">
                {message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {errorMessage && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <XCircle className="h-5 w-5 shrink-0 text-destructive" />

              <p className="text-sm text-destructive">
                {errorMessage}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}