import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BusFront,
  CheckCircle2,
  Heart,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AccountPage() {
  const supabase = await createClient();

  // Verify the currently authenticated user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the user's application profile.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Profile fetch error:", profileError);
  }

  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    "User";

  const role = profile?.role || "user";

  const email = user.email || "";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-5 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BusFront className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                My Account
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage your Kerala Bus Finder account.
              </p>
            </div>
          </div>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Full name */}
            <div className="flex items-center gap-4 rounded-xl border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <UserRound className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Full name
                </p>

                <p className="mt-1 truncate font-medium">
                  {fullName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 rounded-xl border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Email address
                </p>

                <p className="mt-1 truncate font-medium">
                  {email}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Account role
                  </p>

                  <p className="mt-1 font-medium capitalize">
                    {role}
                  </p>
                </div>
              </div>

              <Badge variant={role === "admin" ? "default" : "secondary"}>
                {role}
              </Badge>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Account status
                  </p>

                  <p className="mt-1 font-medium">
                    Active
                  </p>
                </div>
              </div>

              <Badge variant="secondary">
                Active
              </Badge>
            </div>

            {profileError && profileError.code !== "PGRST116" && (
              <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
                Your account is active, but your profile information could
                not be loaded completely.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Favorites */}
          <Card>
            <CardContent className="p-6">
              <Heart className="h-6 w-6 text-primary" />

              <h2 className="mt-4 font-semibold">
                Favorites
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                View your saved bus services.
              </p>

              <Link
                href="/favorites"
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                View Favorites
              </Link>
            </CardContent>
          </Card>

          {/* Contributions */}
          <Card>
            <CardContent className="p-6">
              <BusFront className="h-6 w-6 text-primary" />

              <h2 className="mt-4 font-semibold">
                Contribute
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Submit timetable information for review.
              </p>

              <Link
                href="/add-timetable"
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                Add Timetable
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Card className="mt-6">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                Sign out
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Sign out of your Kerala Bus Finder account.
              </p>
            </div>

            <form action="/auth/signout" method="post">
              <Button
                type="submit"
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}