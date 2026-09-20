"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BusFront,
  CheckCircle2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
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
            onClick={() => (window.location.href = "/login")}
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to login</span>
          </Button>
        </div>
      </header>

      {/* Main */}
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BusFront className="size-6" />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Forgot your password?
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Enter the email address associated with your account and
              we will send you instructions to reset your password.
            </p>
          </div>

          <Card className="p-5 sm:p-7">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      className="h-11 pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                >
                  Send reset link
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            ) : (
              /* Success */
              <div className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                  <CheckCircle2 className="size-6" />
                </div>

                <h2 className="mt-4 font-semibold">
                  Check your email
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">
                    {email}
                  </span>
                  , password reset instructions will be sent there.
                </p>

                <Button
                  className="mt-6 w-full"
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Try another email
                </Button>
              </div>
            )}

            {/* Login */}
            <div className="mt-6 border-t pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?
              </p>

              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() =>
                  (window.location.href = "/login")
                }
              >
                Back to login
              </Button>
            </div>
          </Card>

          {/* Security information */}
          <div className="mt-5 flex gap-3 rounded-xl border bg-background p-4">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

            <p className="text-xs leading-5 text-muted-foreground">
              For security, we wont reveal whether an email address
              has an account. Password reset functionality will be
              connected when authentication is implemented.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}