"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Save, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function EditProfilePage() {
  const supabase = useMemo(() => createClient(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        console.error("Profile load error:", error);
        setErrorMessage("Unable to load your profile.");
      }

      setUserId(user.id);
      setEmail(user.email || "");
      setFullName(
        profile?.full_name ||
          user.user_metadata?.full_name ||
          "",
      );
      setAvatarUrl(profile?.avatar_url || null);
      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setErrorMessage("");
    setMessage("");

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setErrorMessage("Profile pictures must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      return;
    }

    const trimmedName = fullName.trim();

    if (trimmedName.length < 2) {
      setErrorMessage("Please enter a name with at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setErrorMessage("Name must be 100 characters or fewer.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setMessage("");

    let nextAvatarUrl = avatarUrl;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("Avatar upload API error:", result);
          setErrorMessage(
            result.error || "Profile picture upload failed.",
          );
          setSaving(false);
          return;
        }

        nextAvatarUrl = result.publicUrl;
      } catch (uploadError) {
        console.error("Avatar upload request error:", uploadError);
        setErrorMessage(
          "Unable to upload the profile picture. Please try again.",
        );
        setSaving(false);
        return;
      }
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        avatar_url: nextAvatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
      setErrorMessage("Unable to save your profile.");
      setSaving(false);
      return;
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: trimmedName,
      },
    });

    if (metadataError) {
      console.error("Auth metadata update error:", metadataError);
    }

    setAvatarUrl(nextAvatarUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage("Profile updated successfully.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </main>
    );
  }

  const displayedAvatar = previewUrl || avatarUrl;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="-ml-2 mb-5"
          onClick={() => {
            window.location.href = "/account";
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Account
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update the name and profile picture shown on your account.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4 rounded-xl border p-6">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-muted">
                  {displayedAvatar ? (
                    <img
                      src={displayedAvatar}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <div className="text-center">
                  <label
                    htmlFor="avatar"
                    className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-muted"
                  >
                    Choose Profile Picture
                  </label>

                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />

                  <p className="mt-2 text-xs text-muted-foreground">
                    JPG, PNG, WEBP or another image format up to 5 MB.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="full-name"
                  className="text-sm font-medium"
                >
                  Full name
                </label>

                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={100}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email address
                </label>

                <Input id="email" value={email} readOnly disabled />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              {message && (
                <div className="rounded-lg border border-green-300/60 bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950/20 dark:text-green-300">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
