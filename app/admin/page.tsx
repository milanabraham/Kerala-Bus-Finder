"use client";

import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BusFront,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type SubmissionStatus = "Pending" | "Under Review";

type RecentSubmission = {
  id: number;
  service: string;
  route: string;
  submittedBy: string;
  submitted: string;
  status: SubmissionStatus;
};

const recentSubmissions: RecentSubmission[] = [
  {
    id: 1042,
    service: "Sample Service",
    route: "Kottayam → Pala",
    submittedBy: "User 01",
    submitted: "Today",
    status: "Pending",
  },
  {
    id: 1041,
    service: "Sample Service",
    route: "Pala → Kottayam",
    submittedBy: "User 02",
    submitted: "Today",
    status: "Under Review",
  },
  {
    id: 1040,
    service: "Sample Service",
    route: "Kottayam → Pala",
    submittedBy: "User 03",
    submitted: "Yesterday",
    status: "Pending",
  },
  {
    id: 1039,
    service: "Sample Service",
    route: "Pala → Kottayam",
    submittedBy: "User 04",
    submitted: "Yesterday",
    status: "Under Review",
  },
];

const stats = [
  {
    title: "Pending",
    value: "12",
    description: "Awaiting review",
    icon: Clock3,
  },
  {
    title: "Under Review",
    value: "5",
    description: "Currently being reviewed",
    icon: FileCheck2,
  },
  {
    title: "Published",
    value: "87",
    description: "Public timetable entries",
    icon: CheckCircle2,
  },
  {
    title: "Users",
    value: "143",
    description: "Registered accounts",
    icon: Users,
  },
];

export default function AdminDashboardPage() {
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
                <p className="text-sm font-semibold">
                  Kerala Bus Finder
                </p>

                <p className="text-xs text-muted-foreground">
                  Administration
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">
              <Button
                variant="secondary"
                className="shrink-0 justify-start gap-3 lg:w-full"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() =>
                  (window.location.href = "/admin/submissions")
                }
              >
                <FileText className="size-4" />
                Submissions
                <Badge
                  variant="secondary"
                  className="ml-auto hidden lg:inline-flex"
                >
                  12
                </Badge>
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() =>
                  (window.location.href = "/admin/timetables")
                }
              >
                <BusFront className="size-4" />
                Timetables
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() =>
                  (window.location.href = "/admin/users")
                }
              >
                <Users className="size-4" />
                Users
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() =>
                  (window.location.href = "/admin/reports")
                }
              >
                <BarChart3 className="size-4" />
                Reports
              </Button>

              <Button
                variant="ghost"
                className="shrink-0 justify-start gap-3 lg:w-full"
                onClick={() =>
                  (window.location.href = "/admin/settings")
                }
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
                    <p className="text-xs font-medium">
                      Admin preview
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      Authentication and admin permissions will be
                      connected later.
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
                <p className="text-sm font-semibold">
                  Admin Dashboard
                </p>

                <p className="hidden text-xs text-muted-foreground sm:block">
                  Manage timetable submissions and platform data
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="gap-1.5">
                  <ShieldCheck className="size-3.5" />
                  Admin
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/")}
                >
                  Exit
                </Button>
              </div>
            </div>
          </header>

          {/* Dashboard */}
          <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Heading */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Overview
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Monitor submissions and timetable activity.
              </p>
            </div>

            {/* Preview notice */}
            <div className="mt-6 rounded-xl border bg-muted/40 p-4">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                <div>
                  <p className="text-sm font-medium">
                    Dashboard preview
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    The statistics and submissions shown here are
                    preview data for the UI. Real platform statistics
                    will be loaded from the backend later.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Card key={stat.title} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {stat.title}
                        </p>

                        <p className="mt-2 text-3xl font-bold tracking-tight">
                          {stat.value}
                        </p>
                      </div>

                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-5 text-muted-foreground" />
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* Main grid */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
              {/* Recent submissions */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-5 sm:p-6">
                  <div>
                    <h2 className="font-semibold">
                      Recent submissions
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Latest timetable contributions from users.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      (window.location.href = "/admin/submissions")
                    }
                  >
                    View all
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>

                <Separator />

                <div className="divide-y">
                  {recentSubmissions.map((submission) => (
                    <button
                      key={submission.id}
                      type="button"
                      onClick={() =>
                        (window.location.href = `/admin/submissions/${submission.id}`)
                      }
                      className="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div className="flex min-w-0 gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <FileText className="size-5 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {submission.service}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {submission.route}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Submitted by {submission.submittedBy} •{" "}
                            {submission.submitted}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <Badge
                          variant={
                            submission.status === "Pending"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {submission.status}
                        </Badge>

                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Quick actions */}
              <Card className="p-5 sm:p-6">
                <div>
                  <h2 className="font-semibold">
                    Quick actions
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Common administration tasks.
                  </p>
                </div>

                <div className="mt-5 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() =>
                      (window.location.href = "/admin/submissions")
                    }
                  >
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="size-4" />
                      Review submissions
                    </span>

                    <Badge variant="secondary">12</Badge>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() =>
                      (window.location.href = "/admin/timetables")
                    }
                  >
                    <BusFront className="size-4" />
                    Manage timetables
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() =>
                      (window.location.href = "/admin/users")
                    }
                  >
                    <Users className="size-4" />
                    Manage users
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() =>
                      (window.location.href = "/admin/reports")
                    }
                  >
                    <BarChart3 className="size-4" />
                    View reports
                  </Button>
                </div>
              </Card>
            </div>

            {/* System information */}
            <Card className="mt-6 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <ShieldCheck className="size-5 text-muted-foreground" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      System status
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Backend services will be connected during the
                      integration phase.
                    </p>
                  </div>
                </div>

                <Badge variant="outline">
                  UI Preview
                </Badge>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}