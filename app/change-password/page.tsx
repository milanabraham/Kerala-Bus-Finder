"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BusFront,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ChangePasswordPage() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updated, setUpdated] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUpdated(true);
  }

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => (window.location.href = "/account")}
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to account</span>
          </Button>
        </div>
      </header>

      {/* Main */}
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LockKeyhole className="size-6" />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Change password
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Update your password to keep your account secure.
            </p>
          </div>

          <Card className="p-5 sm:p-7">
            {!updated ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current password */}
                <div>
                  <label
                    htmlFor="current-password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Current password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="current-password"
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter current password"
                      className="h-11 pl-10 pr-10"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrent((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showCurrent
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {showCurrent ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-2 block text-sm font-medium"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="new-password"
                      type={showNew ? "text" : "password"}
                      placeholder="Enter new password"
                      className="h-11 pl-10 pr-10"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNew((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showNew
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showNew ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Password requirements
                    </p>

                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="size-3.5" />
                      At least 8 characters
                    </p>

                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="size-3.5" />
                      Contains a number or special character
                    </p>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Confirm new password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Enter new password again"
                      className="h-11 pl-10 pr-10"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showConfirm
                          ? "Hide confirmation password"
                          : "Show confirmation password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                >
                  Update password
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            ) : (
              /* Success */
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                  <Check className="size-6" />
                </div>

                <h2 className="mt-4 font-semibold">
                  Password updated
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your password has been updated in this UI preview.
                </p>

                <Button
                  className="mt-6 w-full gap-2"
                  onClick={() =>
                    (window.location.href = "/account")
                  }
                >
                  Back to account
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </Card>

          {/* Security notice */}
          <div className="mt-5 rounded-xl border bg-background p-4">
            <div className="flex gap-3">
              <BusFront className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

              <p className="text-xs leading-5 text-muted-foreground">
                Password changes are currently simulated for the UI.
                Real authentication and password management will be
                connected later.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}