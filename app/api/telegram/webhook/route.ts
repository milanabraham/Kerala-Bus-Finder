import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing.");
}

if (!adminChatId) {
  throw new Error("TELEGRAM_ADMIN_CHAT_ID is missing.");
}

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
}

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
}

if (!webhookSecret) {
  throw new Error("TELEGRAM_WEBHOOK_SECRET is missing.");
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
);

const categories = {
  timetable: {
    title: "🔎 Bus / Timetable Query",
    prompt:
      "Please send your bus/timetable question.\n\n" +
      "If possible, include:\n" +
      "• Bus/service name\n" +
      "• From\n" +
      "• To\n" +
      "• Date/time\n" +
      "• Your question",
  },

  wrong_info: {
    title: "🐛 Report Wrong Information",
    prompt:
      "Please send the details of the incorrect information.\n\n" +
      "If possible, include:\n" +
      "• Bus/service name\n" +
      "• From\n" +
      "• To\n" +
      "• Information shown in Kerala Bus Finder\n" +
      "• Correct information",
  },

  missing_bus: {
    title: "🚌 Report Missing Bus",
    prompt:
      "Please send the details of the missing bus.\n\n" +
      "If possible, include:\n" +
      "• Bus/service name\n" +
      "• From\n" +
      "• To\n" +
      "• Departure time\n" +
      "• Arrival time\n" +
      "• Any other useful information",
  },

  feature: {
    title: "💡 Suggest a Feature",
    prompt:
      "Tell us about your feature idea.\n\n" +
      "Please explain what you would like Kerala Bus Finder to add or improve.",
  },

  other: {
    title: "📩 Other Query",
    prompt:
      "Please type your question or message.\n\n" +
      "We will forward it to the Kerala Bus Finder team.",
  },
} as const;

type Category = keyof typeof categories;

async function telegram(
  method: string,
  body: Record<string, unknown> = {},
) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json();

  if (!data.ok) {
    throw new Error(
      data.description || "Telegram API error",
    );
  }

  return data.result;
}

function mainKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "🔎 Bus / Timetable Query",
          callback_data: "category:timetable",
        },
      ],
      [
        {
          text: "🐛 Report Wrong Information",
          callback_data: "category:wrong_info",
        },
      ],
      [
        {
          text: "🚌 Report Missing Bus",
          callback_data: "category:missing_bus",
        },
      ],
      [
        {
          text: "💡 Suggest a Feature",
          callback_data: "category:feature",
        },
      ],
      [
        {
          text: "📩 Other Query",
          callback_data: "category:other",
        },
      ],
    ],
  };
}

function cancelKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "❌ Cancel",
          callback_data: "cancel",
        },
      ],
    ],
  };
}

async function sendWelcome(chatId: number) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🚌 Welcome to Kerala Bus Finder!\n\n" +
      "How can we help?",
    reply_markup: mainKeyboard(),
  });
}

async function handleCategory(
  chatId: number,
  category: string,
) {
  if (!(category in categories)) {
    return;
  }

  const selected =
    categories[category as Category];

  const { error } = await supabase
    .from("telegram_user_states")
    .upsert(
      {
        telegram_user_id: chatId,
        category,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "telegram_user_id",
      },
    );

  if (error) {
    console.error(
      "Failed to save Telegram user state:",
      error,
    );

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "⚠️ Something went wrong while selecting the option.\n\n" +
        "Please try again.",
      reply_markup: mainKeyboard(),
    });

    return;
  }

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      `${selected.title}\n\n` +
      `${selected.prompt}\n\n` +
      "When you're ready, send your message below.",
    reply_markup: cancelKeyboard(),
  });
}

async function handleCallbackQuery(
  callbackQuery: {
    id: string;
    data?: string;
    message?: {
      chat?: {
        id?: number;
      };
    };
  },
) {
  const callbackId = callbackQuery.id;
  const chatId =
    callbackQuery.message?.chat?.id;

  if (!chatId) {
    return;
  }

  const data = callbackQuery.data || "";

  await telegram("answerCallbackQuery", {
    callback_query_id: callbackId,
  });

  if (data === "cancel") {
    await supabase
      .from("telegram_user_states")
      .delete()
      .eq("telegram_user_id", chatId);

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "❌ Cancelled.\n\n" +
        "What would you like to do?",
      reply_markup: mainKeyboard(),
    });

    return;
  }

  if (data.startsWith("category:")) {
    const category =
      data.replace("category:", "");

    await handleCategory(
      chatId,
      category,
    );
  }
}

function getUserDisplayName(message: {
  from?: {
    username?: string;
    first_name?: string;
    last_name?: string;
  };
}) {
  const username =
    message.from?.username;

  if (username) {
    return `@${username}`;
  }

  const firstName =
    message.from?.first_name || "";

  const lastName =
    message.from?.last_name || "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  return fullName || "Unknown user";
}

async function handleUserMessage(message: {
  chat: {
    id: number;
  };
  text?: string;
  from?: {
    username?: string;
    first_name?: string;
    last_name?: string;
  };
}) {
  const chatId = message.chat.id;
  const text = (message.text || "").trim();

  if (!text) {
    return;
  }

  if (text === "/start") {
    await supabase
      .from("telegram_user_states")
      .delete()
      .eq("telegram_user_id", chatId);

    await sendWelcome(chatId);
    return;
  }

  if (text === "/cancel") {
    await supabase
      .from("telegram_user_states")
      .delete()
      .eq("telegram_user_id", chatId);

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "❌ Cancelled.\n\n" +
        "What would you like to do?",
      reply_markup: mainKeyboard(),
    });

    return;
  }

  const { data: state, error: stateError } =
    await supabase
      .from("telegram_user_states")
      .select("category")
      .eq("telegram_user_id", chatId)
      .maybeSingle();

  if (stateError) {
    console.error(
      "Failed to read Telegram user state:",
      stateError,
    );

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "⚠️ We couldn't process your query right now.\n\n" +
        "Please try again in a moment.",
    });

    return;
  }

  const category =
    state?.category as Category | undefined;

  if (!category || !categories[category]) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "Please choose an option below first.",
      reply_markup: mainKeyboard(),
    });

    return;
  }

  const selected = categories[category];
  const username =
    getUserDisplayName(message);

  const { error: insertError } =
    await supabase
      .from("telegram_queries")
      .insert({
        telegram_user_id: chatId,
        telegram_username:
          message.from?.username || null,
        telegram_name:
          `${message.from?.first_name || ""} ${
            message.from?.last_name || ""
          }`.trim() || null,
        category,
        message_text: text,
        status: "pending",
      });

  if (insertError) {
    console.error(
      "Failed to save Telegram query:",
      insertError,
    );

    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "⚠️ We couldn't save your query right now.\n\n" +
        "Please try again in a moment.",
    });

    return;
  }

  const adminMessage =
    "🚨 KERALA BUS FINDER QUERY\n\n" +
    `Category: ${selected.title}\n\n` +
    `👤 User: ${username}\n` +
    `🆔 Telegram ID: ${chatId}\n\n` +
    "📝 Message:\n" +
    `${text}\n\n` +
    "────────────────";

  await telegram("sendMessage", {
    chat_id: adminChatId,
    text: adminMessage,
  });

  await supabase
    .from("telegram_user_states")
    .delete()
    .eq("telegram_user_id", chatId);

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "✅ Your query has been received!\n\n" +
      "Thank you for helping improve Kerala Bus Finder. 🚌\n\n" +
      "If you have another query, use /start.",
  });
}

async function handleUpdate(update: {
  callback_query?: {
    id: string;
    data?: string;
    message?: {
      chat?: {
        id?: number;
      };
    };
  };
  message?: {
    chat: {
      id: number;
    };
    text?: string;
    from?: {
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
}) {
  if (update.callback_query) {
    await handleCallbackQuery(
      update.callback_query,
    );
    return;
  }

  if (update.message) {
    await handleUserMessage(
      update.message,
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const receivedSecret =
      request.headers.get(
        "x-telegram-bot-api-secret-token",
      );

    if (
      receivedSecret !== webhookSecret
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const update =
      await request.json();

    console.log(
      "Telegram webhook update:",
      update.update_id,
    );

    await handleUpdate(update);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(
      "Telegram webhook error:",
      error,
    );

    return NextResponse.json({
      ok: false,
    });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Kerala Bus Finder Telegram webhook",
  });
}