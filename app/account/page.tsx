import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  BusFront,
  Heart,
  LogOut,
  MessageCircle,
  PlusCircle,
  UserRound,
} from "lucide-react";

const ink = "#16302B";
const paper = "#FBF8F2";
const cardBorder = "#E4DCC8";
const rust = "#B4451F";
const rustDeep = "#93380F";
const gold = "#C79A3D";
const green = "#3F6B58";
const textMuted = "#5C5546";
const textFaint = "#8A7F68";

const displayFont = {
  fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name || user.user_metadata?.full_name || "User";
  const role = profile?.role || "user";
  const avatarUrl = profile?.avatar_url || null;
  const isAdmin = role === "admin";

  return (
    <main className="min-h-screen" style={{ backgroundColor: paper, color: ink }}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight" style={{ ...displayFont, color: ink }}>
            Account
          </h1>
          <p className="mt-2 text-sm" style={{ color: textMuted }}>
            Manage your profile, messages, favorites, and contributions.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile */}
          <div
            className="overflow-hidden rounded-3xl bg-white"
            style={{ border: `1px solid ${cardBorder}`, boxShadow: "0 30px 60px -35px rgba(22,48,43,0.25)" }}
          >
            <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${rust}, ${gold})` }} />

            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" style={{ color: textFaint }} />
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: textFaint }}>
                    Profile
                  </span>
                </div>

                <Link
                  href="/account/edit"
                  className="inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors hover:bg-[#F1ECDD]"
                  style={{ borderColor: cardBorder, color: ink }}
                >
                  Edit profile
                </Link>
              </div>

              {/* Banner-style header: avatar with gradient ring + name */}
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full p-[3px]"
                  style={{ background: `linear-gradient(135deg, ${rust}, ${gold})` }}
                >
                  <div
                    className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white"
                    style={{ border: `2px solid ${paper}` }}
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={`${fullName}'s profile picture`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-10 w-10" style={{ color: textFaint }} />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-2xl font-medium" style={{ ...displayFont, color: ink }}>
                    {fullName}
                  </h2>
                  <p className="mt-1 break-all text-sm" style={{ color: textMuted }}>
                    {user.email}
                  </p>
                  <span
                    className="mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                    style={
                      isAdmin
                        ? { backgroundColor: rust, color: "#FFFFFF" }
                        : { backgroundColor: "rgba(63,107,88,0.12)", color: green }
                    }
                  >
                    {role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div
            className="overflow-hidden rounded-3xl bg-white"
            style={{ border: `1px solid ${cardBorder}`, boxShadow: "0 30px 60px -35px rgba(22,48,43,0.25)" }}
          >
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-medium" style={{ ...displayFont, color: ink }}>
                Quick actions
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/messages"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(180deg, ${rust}, ${rustDeep})`,
                    boxShadow: "0 12px 24px -10px rgba(180,69,31,0.55)",
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Link>

                <Link
                  href="/favorites"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[#F1ECDD]"
                  style={{ borderColor: cardBorder, color: ink }}
                >
                  <Heart className="h-4 w-4" style={{ color: rust }} />
                  Favorites
                </Link>

                <Link
                  href="/contributions"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[#F1ECDD]"
                  style={{ borderColor: cardBorder, color: ink }}
                >
                  <PlusCircle className="h-4 w-4" style={{ color: green }} />
                  My contributions
                </Link>

                <Link
                  href="/add-timetable"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[#F1ECDD]"
                  style={{ borderColor: cardBorder, color: ink }}
                >
                  <BusFront className="h-4 w-4" style={{ color: gold }} />
                  Add timetable
                </Link>
              </div>
            </div>
          </div>

          {/* Session */}
          <div
            className="overflow-hidden rounded-3xl bg-white"
            style={{ border: `1px solid ${cardBorder}`, boxShadow: "0 30px 60px -35px rgba(22,48,43,0.25)" }}
          >
            <div className="p-5 sm:p-6">
              <h2 className="text-lg font-medium" style={{ ...displayFont, color: ink }}>
                Session
              </h2>

              <form action="/auth/signout" method="post" className="mt-4">
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors hover:bg-[#FBEEE7]"
                  style={{ borderColor: "#E8C4B0", color: rust }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}