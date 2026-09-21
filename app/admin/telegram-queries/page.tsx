"use client";

import {
  ArrowLeft,
  BarChart3,
  Bot,
  BusFront,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  LayoutDashboard,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

type QueryStatus = "pending" | "reviewed" | "resolved";

type TelegramQuery = {
  id: string;
  telegram_user_id: number;
  telegram_username: string | null;
  telegram_name: string | null;
  category: string;
  message_text: string;
  status: QueryStatus;
  created_at: string;
  updated_at: string;
};

const categoryLabels: Record<string, string> = {
  timetable: "Bus / Timetable Query",
  wrong_info: "Wrong Information",
  missing_bus: "Missing Bus",
  feature: "Feature Suggestion",
  other: "Other Query",
};

const statusLabels: Record<QueryStatus, string> = {
  pending: "Pending",
  reviewed: "Reviewed",
  resolved: "Resolved",
};

function formatCategory(category: string) {
  return categoryLabels[category] ?? category;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusVariant(status: QueryStatus) {
  if (status === "pending") {
    return "secondary" as const;
  }

  if (status === "reviewed") {
    return "outline" as const;
  }

  return "default" as const;
}

export default function TelegramQueriesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [queries, setQueries] = useState<TelegramQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadQueries = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const { data, error } = await supabase
        .from("telegram_queries")
        .select(
          "id, telegram_user_id, telegram_username, telegram_name, category, message_text, status, created_at, updated_at, reviewed_notified_at, resolved_notified_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Telegram queries error:", error);
        setErrorMessage("Unable to load Telegram queries.");
        setQueries([]);
      } else {
        setQueries((data ?? []) as TelegramQuery[]);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [supabase],
  );

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const updateStatus = async (queryId: string, status: QueryStatus) => {
    setUpdatingId(queryId);
    setErrorMessage("");

    if (status === "pending") {
      const { error } = await supabase
        .from("telegram_queries")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", queryId);

      if (error) {
        console.error("Reopen Telegram query error:", error);
        setErrorMessage("Unable to reopen the query.");
        setUpdatingId(null);
        return;
      }

      setQueries((current) =>
        current.map((query) =>
          query.id === queryId
            ? {
                ...query,
                status,
                updated_at: new Date().toISOString(),
              }
            : query,
        ),
      );

      setUpdatingId(null);
      return;
    }

    const response = await fetch(
      `/api/admin/telegram-queries/${queryId}/status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("Telegram status API error:", result);
      setErrorMessage(result.error || "Unable to update the query status.");
      setUpdatingId(null);
      return;
    }

    setQueries((current) =>
      current.map((query) =>
        query.id === queryId
          ? {
              ...query,
              status,
              updated_at: new Date().toISOString(),
              ...(status === "reviewed"
                ? {
                    reviewed_notified_at: new Date().toISOString(),
                  }
                : {}),
              ...(status === "resolved"
                ? {
                    resolved_notified_at: new Date().toISOString(),
                  }
                : {}),
            }
          : query,
      ),
    );

    setUpdatingId(null);
  };

  const pendingCount = queries.filter(
    (query) => query.status === "pending",
  ).length;

  const reviewedCount = queries.filter(
    (query) => query.status === "reviewed",
  ).length;

  const resolvedCount = queries.filter(
    (query) => query.status === "resolved",
  ).length;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="border-b bg-background lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="sticky top-0">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b px-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BusFront className="size-5" />
              </div>

              <div>
                <p className="text-sm font-semibold">Kerala Bus Finder</p>

                <p className="text-xs text-muted-foreground">Administration</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">
              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() => (window.location.href = "/admin")}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() => (window.location.href = "/admin/submissions")}
              >
                <FileText className="size-4" />
                Submissions
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() => (window.location.href = "/admin/timetables")}
              >
                <BusFront className="size-4" />
                Timetables
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() => (window.location.href = "/admin/users")}
              >
                <Users className="size-4" />
                Users
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() => (window.location.href = "/admin/reports")}
              >
                <BarChart3 className="size-4" />
                Reports
              </Button>

              <Button
                variant="secondary"
                className="shrink-0 justify-start gap-3 lg:w-full"
              >
                <Bot className="size-4" />
                Telegram Queries
                {pendingCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto hidden lg:inline-flex"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() => (window.location.href = "/admin/settings")}
              >
                <Settings className="size-4" />
                Settings
              </Button>
            </nav>

            <div className="hidden px-5 pb-5 lg:block">
              <Separator className="mb-5" />

              <div className="rounded-xl border bg-muted/40 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <div>
                    <p className="text-xs font-medium">Admin access</p>

                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      Telegram queries are visible only to authorized
                      administrators.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-sm font-semibold">Telegram Queries</p>

                <p className="hidden text-xs text-muted-foreground sm:block">
                  Review questions and reports received through Telegram
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  Admin
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={refreshing}
                  onClick={() => loadQueries(true)}
                >
                  <RefreshCw
                    className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/admin")}
                >
                  Exit
                </Button>
              </div>
            </div>
          </header>

          {/* Page */}
          <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (window.location.href = "/admin")}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>

                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Telegram Queries
                  </h1>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Manage questions, reports, and suggestions sent through the
                  Kerala Bus Finder Telegram bot.
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}

            {/* Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Queries
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                      {queries.length}
                    </p>
                  </div>

                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Bot className="size-5 text-muted-foreground" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  All Telegram submissions
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                      {pendingCount}
                    </p>
                  </div>

                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Clock3 className="size-5 text-muted-foreground" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reviewed</p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                      {reviewedCount}
                    </p>
                  </div>

                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <FileCheck2 className="size-5 text-muted-foreground" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Currently being handled
                </p>
              </Card>

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>

                    <p className="mt-2 text-3xl font-bold tracking-tight">
                      {resolvedCount}
                    </p>
                  </div>

                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <CheckCircle2 className="size-5 text-muted-foreground" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  Completed queries
                </p>
              </Card>
            </div>

            {/* Queries */}
            <Card className="mt-6 overflow-hidden">
              <div className="flex items-center justify-between p-5 sm:p-6">
                <div>
                  <h2 className="font-semibold">Incoming queries</h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Latest messages received from Telegram users.
                  </p>
                </div>

                <Badge variant="outline">{queries.length} total</Badge>
              </div>

              <Separator />

              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Loading Telegram queries...
                  </p>
                </div>
              ) : queries.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-muted">
                    <Bot className="size-6 text-muted-foreground" />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    No Telegram queries yet
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    New questions and reports will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {queries.map((query) => (
                    <div key={query.id} className="p-5 sm:p-6">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={getStatusVariant(query.status)}>
                              {statusLabels[query.status]}
                            </Badge>

                            <Badge variant="outline">
                              {formatCategory(query.category)}
                            </Badge>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-semibold">
                              {query.telegram_username
                                ? `@${query.telegram_username}`
                                : query.telegram_name || "Telegram user"}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Telegram ID: {query.telegram_user_id}
                              {" • "}
                              {formatDate(query.created_at)}
                            </p>
                          </div>

                          <div className="mt-4 rounded-xl border bg-muted/30 p-4">
                            <p className="whitespace-pre-wrap text-sm leading-6">
                              {query.message_text}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2 xl:w-52 xl:flex-col">
                          {query.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === query.id}
                              onClick={() => updateStatus(query.id, "reviewed")}
                            >
                              {updatingId === query.id
                                ? "Updating..."
                                : "Mark Reviewed"}
                            </Button>
                          )}

                          {query.status !== "resolved" && (
                            <Button
                              size="sm"
                              disabled={updatingId === query.id}
                              onClick={() => updateStatus(query.id, "resolved")}
                            >
                              {updatingId === query.id
                                ? "Updating..."
                                : "Mark Resolved"}
                            </Button>
                          )}

                          {query.status === "resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === query.id}
                              onClick={() => updateStatus(query.id, "pending")}
                            >
                              Reopen
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Information */}
            <Card className="mt-6 p-5 sm:p-6">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

                <div>
                  <p className="text-sm font-semibold">Telegram support</p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Queries are stored securely in Supabase and are visible only
                    to authorized administrators. The Telegram bot continues to
                    send new query notifications to the configured support
                    account.
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
