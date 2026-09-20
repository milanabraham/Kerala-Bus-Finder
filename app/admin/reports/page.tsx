"use client";

import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  Users,
  XCircle,
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

const submissionStats = [
  {
    label: "Pending",
    value: 12,
    icon: Clock3,
  },
  {
    label: "Under Review",
    value: 5,
    icon: Activity,
  },
  {
    label: "Approved",
    value: 38,
    icon: CheckCircle2,
  },
  {
    label: "Rejected",
    value: 9,
    icon: XCircle,
  },
];

const recentActivity = [
  {
    title: "Timetable submission received",
    description:
      "A new timetable submission entered the review queue.",
    time: "Today, 10:42 AM",
    type: "Submission",
  },
  {
    title: "Timetable approved",
    description:
      "An administrator approved a submitted timetable.",
    time: "Today, 09:18 AM",
    type: "Approval",
  },
  {
    title: "Timetable published",
    description:
      "An approved timetable was published to the public timetable.",
    time: "Yesterday, 06:30 PM",
    type: "Publication",
  },
  {
    title: "New user registered",
    description:
      "A new user account was created.",
    time: "Yesterday, 04:12 PM",
    type: "User",
  },
];

export default function AdminReportsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <h1 className="text-xl font-semibold">
                Reports & Analytics
              </h1>

              <p className="text-sm text-muted-foreground">
                Overview of timetable, submissions and user activity.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="hidden sm:flex">
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Admin Reports
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Preview warning */}
        <Card className="border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <p className="font-medium">
                Preview analytics
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                The figures shown on this page are sample values for
                the UI. Real analytics will be connected after the
                database and backend are implemented.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Overview */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Overview
              </h2>

              <p className="text-sm text-muted-foreground">
                Current system summary.
              </p>
            </div>

            <Badge variant="outline">
              Preview
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Total Timetables
                  </p>

                  <FileCheck2 className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="mt-2 text-3xl font-bold">
                  133
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Timetable entries in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Published Timetables
                  </p>

                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="mt-2 text-3xl font-bold">
                  87
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Currently available to users
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Registered Users
                  </p>

                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="mt-2 text-3xl font-bold">
                  143
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  User accounts
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submission statistics */}
        <Card>
          <CardHeader>
            <CardTitle>
              Submission Statistics
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Status of user-submitted timetable information.
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {submissionStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-xl border p-5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>

                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <p className="mt-2 text-2xl font-bold">
                      {item.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Timetable analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Timetable Status
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Published
                  </span>

                  <span className="text-sm text-muted-foreground">
                    87
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: "65%" }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Draft
                  </span>

                  <span className="text-sm text-muted-foreground">
                    24
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: "18%" }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Unverified
                  </span>

                  <span className="text-sm text-muted-foreground">
                    22
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/40"
                    style={{ width: "17%" }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Percentages are illustrative preview values.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Operator Distribution
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Government
                  </span>

                  <span className="text-sm text-muted-foreground">
                    78
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: "59%" }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Private
                  </span>

                  <span className="text-sm text-muted-foreground">
                    55
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: "41%" }}
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Operator classification will come from verified
                timetable data in the backend phase.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Verification metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>
                  Verification Metrics
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  Preview of the admin verification workflow.
                </p>
              </div>

              <Filter className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Pending Reviews
                </p>

                <p className="mt-2 text-2xl font-bold">
                  12
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Waiting for administrator review
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Approval Rate
                </p>

                <p className="mt-2 text-2xl font-bold">
                  81%
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Illustrative preview calculation
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Rejection Rate
                </p>

                <p className="mt-2 text-2xl font-bold">
                  19%
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Illustrative preview calculation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User activity */}
        <Card>
          <CardHeader>
            <CardTitle>
              User Activity
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Preview contribution and registration metrics.
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Total Users
                </p>

                <p className="mt-2 text-2xl font-bold">
                  143
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Active Contributors
                </p>

                <p className="mt-2 text-2xl font-bold">
                  42
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  New Users
                </p>

                <p className="mt-2 text-2xl font-bold">
                  17
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Preview period
                </p>
              </div>

              <div className="rounded-xl border p-5">
                <p className="text-sm text-muted-foreground">
                  Submissions
                </p>

                <p className="mt-2 text-2xl font-bold">
                  64
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>
              Recent Activity
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Recent system events shown as preview data.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.title}>
                <div className="flex gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    {activity.type === "Submission" && (
                      <FileCheck2 className="h-4 w-4" />
                    )}

                    {activity.type === "Approval" && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    {activity.type === "Publication" && (
                      <BarChart3 className="h-4 w-4" />
                    )}

                    {activity.type === "User" && (
                      <Users className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row">
                      <p className="font-medium">
                        {activity.title}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {activity.description}
                    </p>

                    <Badge
                      variant="outline"
                      className="mt-2"
                    >
                      {activity.type}
                    </Badge>
                  </div>
                </div>

                {index < recentActivity.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Report scope */}
        <Card>
          <CardHeader>
            <CardTitle>
              Planned Report Data
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  Timetable Reports
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Published, draft, verified and unverified entries.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  Contribution Reports
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Submission and review activity.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  User Reports
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Registration and contribution activity.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  Route Coverage
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Routes and stops represented in the database.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  Operator Reports
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Operator and service distribution.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="font-medium">
                  Verification Reports
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Review outcomes and verification history.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <p className="pb-4 text-center text-xs text-muted-foreground">
          Kerala Bus Finder · Admin reports · Preview data
        </p>
      </div>
    </main>
  );
}