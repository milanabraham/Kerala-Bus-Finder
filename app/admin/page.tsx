import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "./admin-dashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">
            You dont have permission
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            You must be an administrator to access the Admin Dashboard.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Sign in
            </a>

            <a
              href="/"
              className="rounded-lg border px-4 py-2 text-sm font-medium"
            >
              Go Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">
            You dont have permission
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have administrator permissions.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Go Home
          </a>
        </div>
      </main>
    );
  }

  return <AdminDashboard />;
}