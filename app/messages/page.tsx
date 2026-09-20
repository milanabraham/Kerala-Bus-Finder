"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Loader2, MessageCircle, UserRound } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const ink = "#16302B";
const paper = "#FBF8F2";
const cardBorder = "#E4DCC8";
const rust = "#B4451F";
const gold = "#C79A3D";
const green = "#3F6B58";
const textMuted = "#5C5546";
const textFaint = "#8A7F68";

const displayFont = {
  fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
};

type Conversation = {
  id: string;
  service_id: string;
  travel_date: string;
  user_one_id: string;
  user_two_id: string;
};

type PublicTravelerProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type ConversationRow = Conversation & {
  unreadCount: number;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
};

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Please log in to view your messages.");
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("conversations")
      .select("id, service_id, travel_date, user_one_id, user_two_id")
      .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Conversation list error:", error);
      setErrorMessage("Unable to load your conversations.");
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Conversation[];

    if (rows.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const otherUserIds = rows.map((row) =>
      row.user_one_id === user.id ? row.user_two_id : row.user_one_id,
    );

    const { data: profiles, error: profileError } = await supabase.rpc(
      "get_public_traveler_profiles",
      { p_user_ids: [...new Set(otherUserIds)] },
    );

    if (profileError) {
      console.error("Conversation profile list error:", profileError);
    }

    const profileMap = new Map<
      string,
      { fullName: string; avatarUrl: string | null }
    >(
      ((profiles ?? []) as PublicTravelerProfile[]).map((profile) => [
        profile.id,
        {
          fullName: profile.full_name || "Traveler",
          avatarUrl: profile.avatar_url || null,
        },
      ]),
    );

    const result = await Promise.all(
      rows.map(async (row) => {
        const otherUserId =
          row.user_one_id === user.id ? row.user_two_id : row.user_one_id;

        const { count, error: unreadError } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", row.id)
          .neq("sender_id", user.id)
          .eq("is_read", false);

        if (unreadError) {
          console.error("Unread count error:", unreadError);
        }

        return {
          ...row,
          otherUserName: profileMap.get(otherUserId)?.fullName || "Traveler",
          otherUserAvatarUrl:
            profileMap.get(otherUserId)?.avatarUrl || null,
          unreadCount: count ?? 0,
        };
      }),
    );

    setConversations(result);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const totalUnread = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );

  if (loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: paper, color: ink }}>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" style={{ color: rust }} />
          <span className="text-sm" style={{ color: textMuted }}>
            Loading your conversations…
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: paper, color: ink }}>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="-ml-2 mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-black/5"
          style={{ color: ink }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div
          className="overflow-hidden rounded-3xl bg-white"
          style={{
            border: `1px solid ${cardBorder}`,
            boxShadow: "0 30px 60px -35px rgba(22,48,43,0.25)",
          }}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: `linear-gradient(90deg, ${rust}, ${gold})` }}
          />

          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(22,48,43,0.08)" }}
                >
                  <MessageCircle className="h-5 w-5" style={{ color: ink }} />
                </div>
                <div>
                  <h1
                    className="text-xl font-medium"
                    style={{ ...displayFont, color: ink }}
                  >
                    Messages
                  </h1>
                  <p className="mt-0.5 text-sm" style={{ color: textMuted }}>
                    Your Travel Together conversations.
                  </p>
                </div>
              </div>

              {totalUnread > 0 && (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: rust }}
                >
                  {totalUnread} unread
                </span>
              )}
            </div>

            <div className="mt-6">
              {errorMessage ? (
                <div
                  className="rounded-lg border px-4 py-3 text-sm font-medium"
                  style={{
                    borderColor: "#E8C4B0",
                    backgroundColor: "#FBEEE7",
                    color: rust,
                  }}
                >
                  {errorMessage}
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-14 text-center">
                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(22,48,43,0.06)" }}
                  >
                    <MessageCircle
                      className="h-6 w-6"
                      style={{ color: textFaint }}
                    />
                  </div>
                  <p
                    className="mt-4 text-base font-medium"
                    style={{ ...displayFont, color: ink }}
                  >
                    No conversations yet
                  </p>
                  <p className="mt-1 text-sm" style={{ color: textMuted }}>
                    Start a conversation from the Travel Together section on a
                    bus.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      href={`/messages/${conversation.id}`}
                      className="block rounded-2xl border p-4 transition-colors hover:bg-[#F1ECDD]"
                      style={{ borderColor: cardBorder }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
                          style={{ backgroundColor: "rgba(63,107,88,0.12)" }}
                        >
                          {conversation.otherUserAvatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={conversation.otherUserAvatarUrl}
                              alt={`${conversation.otherUserName}'s profile picture`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound
                              className="h-5 w-5"
                              style={{ color: green }}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className="truncate font-medium"
                              style={{ color: ink }}
                            >
                              {conversation.otherUserName}
                            </p>

                            {conversation.unreadCount > 0 && (
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                                style={{ backgroundColor: rust }}
                              >
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>

                          <div
                            className="mt-1 flex items-center gap-1.5 text-xs"
                            style={{ color: textFaint }}
                          >
                            <CalendarDays className="h-3.5 w-3.5" />
                            {new Intl.DateTimeFormat("en-IN", {
                              dateStyle: "medium",
                            }).format(
                              new Date(`${conversation.travel_date}T00:00:00`),
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
