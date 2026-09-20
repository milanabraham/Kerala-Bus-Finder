"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock3,
  Database,
  Globe,
  Lock,
  Save,
  Shield,
  UserCog,
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

export default function AdminSettingsPage() {
  const router = useRouter();

  const [siteName, setSiteName] =
    useState("Kerala Bus Finder");

  const [supportEmail, setSupportEmail] =
    useState("support@example.com");

  const [timezone, setTimezone] =
    useState("Asia/Kolkata");

  const [autoPublish, setAutoPublish] =
    useState(false);

  const [requireVerification, setRequireVerification] =
    useState(true);

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [maintenanceMode, setMaintenanceMode] =
    useState(false);

  const [message, setMessage] = useState("");

  function handleSave() {
    setMessage("Settings saved in preview mode.");
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
              onClick={() => router.push("/admin")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div>
              <h1 className="text-xl font-semibold">
                Admin Settings
              </h1>

              <p className="text-sm text-muted-foreground">
                Configure application and administration settings.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="hidden sm:flex">
            <Shield className="mr-1.5 h-4 w-4" />
            Administrator
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Preview warning */}
        <Card className="border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <p className="font-medium">
                Preview settings
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                These settings are currently UI-only. They will be
                connected to the application configuration and
                database during the backend phase.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* General settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              General Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Application Name
              </label>

              <Input
                value={siteName}
                onChange={(e) =>
                  setSiteName(e.target.value)
                }
              />

              <p className="text-xs text-muted-foreground">
                Name displayed throughout the application.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Support Email
              </label>

              <Input
                type="email"
                value={supportEmail}
                onChange={(e) =>
                  setSupportEmail(e.target.value)
                }
              />

              <p className="text-xs text-muted-foreground">
                Contact address shown to users for support.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Timezone
              </label>

              <select
                value={timezone}
                onChange={(e) =>
                  setTimezone(e.target.value)
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="Asia/Kolkata">
                  Asia/Kolkata
                </option>

                <option value="UTC">
                  UTC
                </option>
              </select>

              <p className="text-xs text-muted-foreground">
                Timetable times will use the selected timezone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timetable settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Timetable Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Verification */}
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Require Admin Verification
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Submitted timetable information must be reviewed
                  before it becomes publicly available.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRequireVerification(
                    !requireVerification
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  requireVerification
                    ? "bg-primary"
                    : "bg-muted"
                }`}
                aria-label="Toggle admin verification"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    requireVerification
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Auto publish */}
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Automatic Publishing
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Automatically publish approved timetable entries.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setAutoPublish(!autoPublish)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  autoPublish
                    ? "bg-primary"
                    : "bg-muted"
                }`}
                aria-label="Toggle automatic publishing"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    autoPublish
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="rounded-lg border border-blue-300 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
              <p className="text-sm font-medium">
                Recommended workflow
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Keep admin verification enabled so user-submitted
                timetable information is reviewed before publication.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Email Notifications
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Notify administrators about new submissions and
                  important account activity.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEmailNotifications(
                    !emailNotifications
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  emailNotifications
                    ? "bg-primary"
                    : "bg-muted"
                }`}
                aria-label="Toggle email notifications"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    emailNotifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Admin Authentication
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Administrator access will be protected by the
                  authentication system.
                </p>
              </div>

              <Badge variant="outline">
                Planned
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Role-Based Access
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Only authorized administrators should access admin
                  functionality.
                </p>
              </div>

              <Badge variant="outline">
                Planned
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Review Audit History
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Approval, rejection and publishing actions will be
                  recorded for auditing.
                </p>
              </div>

              <Badge variant="outline">
                Planned
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              System
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Application Status
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Current application availability.
                </p>
              </div>

              <Badge>
                Operational
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Database
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Database connection will be configured later.
                </p>
              </div>

              <Badge variant="outline">
                Not Connected
              </Badge>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  Maintenance Mode
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Temporarily prevent normal public access while
                  maintenance is performed.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMaintenanceMode(!maintenanceMode)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  maintenanceMode
                    ? "bg-primary"
                    : "bg-muted"
                }`}
                aria-label="Toggle maintenance mode"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    maintenanceMode
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <Card>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">
                Save Configuration
              </p>

              <p className="text-sm text-muted-foreground">
                Apply the current preview settings.
              </p>
            </div>

            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Message */}
        {message && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />

              <p className="text-sm">
                {message}
              </p>
            </CardContent>
          </Card>
        )}

        <Separator />

        <p className="pb-4 text-center text-xs text-muted-foreground">
          Kerala Bus Finder · Admin settings · Preview mode
        </p>
      </div>
    </main>
  );
}