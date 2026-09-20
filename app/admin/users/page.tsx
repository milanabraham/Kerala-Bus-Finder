"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  KeyRound,
  Search,
  Shield,
  UserCog,
  Users,
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

type UserRole = "User" | "Admin";
type UserStatus = "Active" | "Suspended";

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  contributions: number;
  joined: string;
};

const previewUsers: AppUser[] = [
  {
    id: "USR-1001",
    name: "User One",
    email: "user1@example.com",
    role: "User",
    status: "Active",
    contributions: 4,
    joined: "12 September 2026",
  },
  {
    id: "USR-1002",
    name: "User Two",
    email: "user2@example.com",
    role: "User",
    status: "Active",
    contributions: 8,
    joined: "08 September 2026",
  },
  {
    id: "USR-1003",
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    status: "Active",
    contributions: 12,
    joined: "01 September 2026",
  },
  {
    id: "USR-1004",
    name: "User Three",
    email: "user3@example.com",
    role: "User",
    status: "Suspended",
    contributions: 2,
    joined: "28 August 2026",
  },
  {
    id: "USR-1005",
    name: "User Four",
    email: "user4@example.com",
    role: "User",
    status: "Active",
    contributions: 15,
    joined: "21 August 2026",
  },
];

export default function AdminUsersPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<"All" | UserRole>("All");

  const [statusFilter, setStatusFilter] =
    useState<"All" | UserStatus>("All");

  const [message, setMessage] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return previewUsers.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, roleFilter, statusFilter]);

  function handleAction(action: string, user: AppUser) {
    setMessage(`${action}: ${user.name} — preview mode only.`);
  }

  function getRoleBadge(role: UserRole) {
    if (role === "Admin") {
      return (
        <Badge>
          <Shield className="mr-1 h-3.5 w-3.5" />
          Admin
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        User
      </Badge>
    );
  }

  function getStatusBadge(status: UserStatus) {
    if (status === "Active") {
      return (
        <Badge>
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          Active
        </Badge>
      );
    }

    return (
      <Badge variant="destructive">
        <Ban className="mr-1 h-3.5 w-3.5" />
        Suspended
      </Badge>
    );
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
                User Management
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage Kerala Bus Finder users and permissions.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="hidden sm:flex">
            <Users className="mr-1.5 h-4 w-4" />
            Admin
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
                Preview user management
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                These users are sample records. Account changes,
                suspension, role changes and password actions are
                not connected to authentication yet.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total Users
                </p>

                <Users className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-2 text-2xl font-bold">
                143
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Active Users
                </p>

                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-2 text-2xl font-bold">
                137
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Contributors
                </p>

                <UserCog className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-2 text-2xl font-bold">
                42
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Admins
                </p>

                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-2 text-2xl font-bold">
                3
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or user ID..."
                className="pl-9"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Role
                </label>

                <select
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(
                      e.target.value as "All" | UserRole
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="All">All Roles</option>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Account Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "All"
                        | UserStatus
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="All">
                    All Statuses
                  </option>
                  <option value="Active">
                    Active
                  </option>
                  <option value="Suspended">
                    Suspended
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User list */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Users</CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Showing {filteredUsers.length} preview users
                </p>
              </div>

              <Badge variant="outline">
                {filteredUsers.length} Results
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="rounded-lg border border-dashed p-10 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 font-medium">
                  No users found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try another search or change your filters.
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* User information */}
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {user.name}
                          </h3>

                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.status)}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {user.email}
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              User ID
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {user.id}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Contributions
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {user.contributions}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Joined
                            </p>

                            <p className="mt-1 text-sm font-medium">
                              {user.joined}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAction("View user", user)
                        }
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        View
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAction(
                            "Change role",
                            user
                          )
                        }
                      >
                        <UserCog className="mr-1.5 h-4 w-4" />
                        Role
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAction(
                            user.status === "Active"
                              ? "Suspend account"
                              : "Reactivate account",
                            user
                          )
                        }
                      >
                        {user.status === "Active" ? (
                          <>
                            <Ban className="mr-1.5 h-4 w-4" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Reactivate
                          </>
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleAction(
                            "Reset password",
                            user
                          )
                        }
                        aria-label={`Reset password for ${user.name}`}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Admin permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Role & Permission Overview</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />

                  <h3 className="font-medium">
                    Regular User
                  </h3>
                </div>

                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Search bus timetables</li>
                  <li>• Save favorite services</li>
                  <li>• Submit timetable information</li>
                  <li>• View own contributions</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />

                  <h3 className="font-medium">
                    Administrator
                  </h3>
                </div>

                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Review timetable submissions</li>
                  <li>• Manage published timetables</li>
                  <li>• Manage users</li>
                  <li>• View reports and system settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow */}
        <Card>
          <CardHeader>
            <CardTitle>User Management Workflow</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <Badge variant="outline">1</Badge>

                <p className="mt-3 font-medium">
                  Register
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  User creates an account.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <Badge variant="outline">2</Badge>

                <p className="mt-3 font-medium">
                  Contribute
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  User can submit timetable information.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <Badge variant="outline">3</Badge>

                <p className="mt-3 font-medium">
                  Review
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Admin reviews user activity when needed.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <Badge variant="outline">4</Badge>

                <p className="mt-3 font-medium">
                  Manage
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Admin can manage role or account status.
                </p>
              </div>
            </div>
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
          Kerala Bus Finder · Admin user management · Preview data
        </p>
      </div>
    </main>
  );
}