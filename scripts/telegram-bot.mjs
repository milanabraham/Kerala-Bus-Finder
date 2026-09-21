import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
}

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
);

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is missing.");
}

if (!adminChatId) {
  throw new Error("TELEGRAM_ADMIN_CHAT_ID is missing.");
}

let offset = 0;

// Stores the category selected by each Telegram user.
// This is fine for the local prototype.
const userStates = new Map();

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
};

async function telegram(method, body = {}) {
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
    throw new Error(data.description || "Telegram API error");
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

async function sendWelcome(chatId) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "🚌 Welcome to Kerala Bus Finder!\n\n" +
      "How can we help?",
    reply_markup: mainKeyboard(),
  });
}

async function handleCategory(chatId, category) {
  const selected = categories[category];

  if (!selected) {
    return;
  }

  userStates.set(chatId, category);

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      `${selected.title}\n\n` +
      `${selected.prompt}\n\n` +
      "When you're ready, send your message below.",
    reply_markup: cancelKeyboard(),
  });
}

async function handleCallbackQuery(callbackQuery) {
  const callbackId = callbackQuery.id;
  const chatId = callbackQuery.message?.chat?.id;

  if (!chatId) {
    return;
  }

  const data = callbackQuery.data || "";

  await telegram("answerCallbackQuery", {
    callback_query_id: callbackId,
  });

  if (data === "cancel") {
    userStates.delete(chatId);

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "❌ Cancelled.\n\nWhat would you like to do?",
      reply_markup: mainKeyboard(),
    });

    return;
  }

  if (data.startsWith("category:")) {
    const category = data.replace("category:", "");
    await handleCategory(chatId, category);
  }
}

function getUserDisplayName(message) {
  const username = message.from?.username;

  if (username) {
    return `@${username}`;
  }

  const firstName = message.from?.first_name || "";
  const lastName = message.from?.last_name || "";

  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Unknown user";
}

async function handleUserMessage(message) {
  const chatId = message.chat.id;
  const text = (message.text || "").trim();

  if (!text) {
    return;
  }

  if (text === "/start") {
    userStates.delete(chatId);
    await sendWelcome(chatId);
    return;
  }

  if (text === "/cancel") {
    userStates.delete(chatId);

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "❌ Cancelled.\n\nWhat would you like to do?",
      reply_markup: mainKeyboard(),
    });

    return;
  }

  const category = userStates.get(chatId);

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
  const username = getUserDisplayName(message);
  const { error: insertError } = await supabase
  .from("telegram_queries")
  .insert({
    telegram_user_id: chatId,
    telegram_username: message.from?.username || null,
    telegram_name: `${message.from?.first_name || ""} ${
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

  userStates.delete(chatId);

  await telegram("sendMessage", {
    chat_id: chatId,
    text:
      "✅ Your query has been received!\n\n" +
      "Thank you for helping improve Kerala Bus Finder. 🚌\n\n" +
      "If you have another query, use /start.",
  });
}

async function handleUpdate(update) {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

  if (update.message) {
    await handleUserMessage(update.message);
  }
}

async function initializeOffset() {
  try {
    const pendingUpdates = await telegram("getUpdates", {
      offset: -1,
      timeout: 0,
      allowed_updates: ["message", "callback_query"],
    });

    if (pendingUpdates.length > 0) {
      offset = pendingUpdates[pendingUpdates.length - 1].update_id + 1;
    }
  } catch (error) {
    console.error(
      "Unable to initialize Telegram updates:",
      error.message,
    );
  }
}

async function poll() {
  try {
    const updates = await telegram("getUpdates", {
      offset,
      timeout: 30,
      allowed_updates: ["message", "callback_query"],
    });

    for (const update of updates) {
      offset = update.update_id + 1;

      try {
        await handleUpdate(update);
      } catch (error) {
        console.error(
          `Error handling update ${update.update_id}:`,
          error.message,
        );
      }
    }
  } catch (error) {
    console.error("Telegram polling error:", error.message);
  }

  setTimeout(poll, 1000);
}

async function startBot() {
  console.log("🤖 Kerala Bus Finder Telegram bot starting...");

  await initializeOffset();

  console.log("✅ Telegram bot is ready.");

  poll();
}

startBot();