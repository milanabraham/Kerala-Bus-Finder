"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

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

type Conversation = {
  id: string;
  service_id: string;
  travel_date: string;
  user_one_id: string;
  user_two_id: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
};

type PublicTravelerProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherUserName, setOtherUserName] = useState("Traveler");
  const [otherUserAvatarUrl, setOtherUserAvatarUrl] = useState<string | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadConversation = useCallback(async () => {
    if (!conversationId) {
      setErrorMessage("Invalid conversation.");
      setLoading(false);
      return;
    }

    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .select(
        "id, service_id, travel_date, user_one_id, user_two_id",
      )
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError) {
      console.error("Conversation load error:", conversationError);
      setErrorMessage("Unable to load this conversation.");
      setLoading(false);
      return;
    }

    if (!conversationData) {
      setErrorMessage("This conversation does not exist or you do not have access.");
      setLoading(false);
      return;
    }

    const typedConversation = conversationData as Conversation;

    if (
      typedConversation.user_one_id !== user.id &&
      typedConversation.user_two_id !== user.id
    ) {
      setErrorMessage("You do not have access to this conversation.");
      setLoading(false);
      return;
    }

    setConversation(typedConversation);

    const otherUserId =
      typedConversation.user_one_id === user.id
        ? typedConversation.user_two_id
        : typedConversation.user_one_id;

    const { data: profiles, error: profileError } = await supabase.rpc(
      "get_public_traveler_profiles",
      { p_user_ids: [otherUserId] },
    );

    if (profileError) {
      console.error("Conversation profile error:", profileError);
    } else {
      const publicProfiles = (profiles ?? []) as PublicTravelerProfile[];
      setOtherUserName(publicProfiles[0]?.full_name || "Traveler");
      setOtherUserAvatarUrl(publicProfiles[0]?.avatar_url || null);
    }

    const { data: messageRows, error: messagesError } = await supabase
      .from("messages")
      .select(
        "id, conversation_id, sender_id, message_text, is_read, created_at",
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Messages load error:", messagesError);
      setErrorMessage("Unable to load messages.");
      setLoading(false);
      return;
    }

    const loadedMessages = (messageRows ?? []) as Message[];
    setMessages(loadedMessages);

    const unreadIds = loadedMessages
      .filter((message) => message.sender_id !== user.id && !message.is_read)
      .map((message) => message.id);

    setUnreadCount(unreadIds.length);

    if (unreadIds.length > 0) {
      const { error: readError } = await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (readError) {
        console.error("Mark messages read error:", readError);
      } else {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            unreadIds.includes(message.id)
              ? { ...message, is_read: true }
              : message,
          ),
        );
        setUnreadCount(0);
      }
    }

    setLoading(false);
  }, [conversationId, router, supabase]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      return;
    }

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const incomingMessage = payload.new as Message;

          setMessages((currentMessages) => {
            if (currentMessages.some((message) => message.id === incomingMessage.id)) {
              return currentMessages;
            }

            return [...currentMessages, incomingMessage];
          });

          if (incomingMessage.sender_id !== currentUserId && !incomingMessage.is_read) {
            setUnreadCount((count) => count + 1);
            const { error: readError } = await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", incomingMessage.id);

            if (readError) {
              console.error("Realtime mark read error:", readError);
            } else {
              setMessages((currentMessages) =>
                currentMessages.map((message) =>
                  message.id === incomingMessage.id
                    ? { ...message, is_read: true }
                    : message,
                ),
              );
              setUnreadCount(0);
            }
          }
        },
      )
      .subscribe((status, error) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime messaging connected.");
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error("Realtime messaging error:", status, error);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, supabase]);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || !conversation || !currentUserId || sending) {
      return;
    }

    if (trimmedMessage.length > 2000) {
      setErrorMessage("Messages can contain up to 2,000 characters.");
      return;
    }

    setSending(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: currentUserId,
        message_text: trimmedMessage,
      })
      .select(
        "id, conversation_id, sender_id, message_text, is_read, created_at",
      )
      .single();

    if (error) {
      console.error("Send message error:", error);
      setErrorMessage(
        "Unable to send this message. The conversation may no longer be available.",
      );
      setSending(false);
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      data as Message,
    ]);
    setMessageText("");
    setSending(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: paper, color: ink }}>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" style={{ color: rust }} />
          <span className="text-sm" style={{ color: textMuted }}>
            Loading conversation…
          </span>
        </div>
      </main>
    );
  }

  if (errorMessage && !conversation) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: paper, color: ink }}>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div
            className="rounded-3xl bg-white p-6"
            style={{ border: `1px solid ${cardBorder}`, boxShadow: "0 30px 60px -35px rgba(22,48,43,0.25)" }}
          >
            <p className="text-sm font-medium" style={{ color: rust }}>
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => router.push("/search")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5"
              style={{ borderColor: cardBorder, color: ink }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to search
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: paper, color: ink }}>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="-ml-2 mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors hover:bg-black/5"
          style={{ color: ink }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div
          className="overflow-hidden rounded-3xl bg-white"
          style={{ border: `1px solid ${cardBorder}`, boxShadow: "0 30px 60px -35px rgba(22,48,43,0.25)" }}
        >
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${rust}, ${gold})` }} />

          {/* Header */}
          <div className="border-b p-5 sm:p-6" style={{ borderColor: cardBorder }}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full p-[2px]"
                style={{ background: `linear-gradient(135deg, ${rust}, ${gold})` }}
              >
                <div
                  className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white"
                >
                  {otherUserAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={otherUserAvatarUrl}
                      alt={`${otherUserName}'s profile picture`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-5 w-5" style={{ color: green }} />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-medium" style={{ ...displayFont, color: ink }}>
                    {otherUserName}
                  </h1>
                  {unreadCount > 0 && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                      style={{ backgroundColor: rust }}
                    >
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs" style={{ color: textFaint }}>
                  Travel Together
                </p>
              </div>
            </div>

            {conversation && (
              <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: textFaint }}>
                <CalendarDays className="h-3.5 w-3.5" />
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                }).format(
                  new Date(`${conversation.travel_date}T00:00:00`),
                )}
              </div>
            )}
          </div>

          {/* Message thread */}
          <div className="min-h-[420px] space-y-3 overflow-y-auto p-4 sm:p-6">
            {messages.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(22,48,43,0.06)" }}
                >
                  <MessageCircle className="h-6 w-6" style={{ color: textFaint }} />
                </div>
                <p className="mt-4 text-base font-medium" style={{ ...displayFont, color: ink }}>
                  No messages yet
                </p>
                <p className="mt-1 max-w-sm text-sm" style={{ color: textMuted }}>
                  Start the conversation with {otherUserName}.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === currentUserId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%]"
                      style={
                        isOwnMessage
                          ? { background: `linear-gradient(180deg, ${rust}, ${rustDeep})`, color: "#FFFFFF" }
                          : { backgroundColor: "#F1ECDD", color: ink }
                      }
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {message.message_text}
                      </p>
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: isOwnMessage ? "rgba(255,255,255,0.75)" : textFaint }}
                      >
                        {formatMessageTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {errorMessage && (
            <div className="border-t px-4 py-3" style={{ borderColor: cardBorder }}>
              <p className="text-sm font-medium" style={{ color: rust }}>
                {errorMessage}
              </p>
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={handleSendMessage}
            className="border-t p-4 sm:p-5"
            style={{ borderColor: cardBorder }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder={`Message ${otherUserName}...`}
                maxLength={2000}
                rows={3}
                disabled={sending}
                className="flex min-h-[84px] w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-transparent focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ borderColor: cardBorder, color: ink }}
              />

              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:min-w-24"
                style={{
                  background: `linear-gradient(180deg, ${rust}, ${rustDeep})`,
                  boxShadow: "0 12px 24px -10px rgba(180,69,31,0.55)",
                }}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: textFaint }}>
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Keep personal information private.</span>
              <span className="ml-auto">{messageText.length}/2000</span>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}