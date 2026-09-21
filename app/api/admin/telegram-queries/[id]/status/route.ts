import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type QueryStatus = "reviewed" | "resolved";

const statusMessages: Record<"reviewed" | "resolved", string> = {
  reviewed:
    "🔎 Your Kerala Bus Finder query is being reviewed.\n\n" +
    "Our team has received your report and is currently checking it. " +
    "We'll update you when it is resolved. 🚌",

  resolved:
    "✅ Your Kerala Bus Finder query has been resolved.\n\n" +
    "Thank you for helping us improve Kerala Bus Finder! 🚌",
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 },
      );
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 },
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    if (body.status !== "reviewed" && body.status !== "resolved") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const status: QueryStatus = body.status;

    const { data: query, error: queryError } = await supabase
      .from("telegram_queries")
      .select(
        "id, telegram_user_id, status, reviewed_notified_at, resolved_notified_at",
      )
      .eq("id", id)
      .single();

    if (queryError || !query) {
      return NextResponse.json(
        { error: "Telegram query not found." },
        { status: 404 },
      );
    }

    const notificationColumn =
      status === "reviewed" ? "reviewed_notified_at" : "resolved_notified_at";

    const alreadyNotified =
      status === "reviewed"
        ? query.reviewed_notified_at
        : query.resolved_notified_at;

    if (alreadyNotified) {
      return NextResponse.json({
        success: true,
        notificationSent: false,
        message: "Status notification was already sent.",
      });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Telegram bot is not configured." },
        { status: 500 },
      );
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: query.telegram_user_id,
          text: statusMessages[status],
        }),
      },
    );

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramResult.ok) {
      console.error("Telegram notification failed:", telegramResult);

      return NextResponse.json(
        { error: "Unable to send Telegram notification." },
        { status: 502 },
      );
    }

    const now = new Date().toISOString();

    const updateData: Record<string, string> = {
      status,
      updated_at: now,
    };

    updateData[notificationColumn] = now;

    const { error: updateError } = await supabase
      .from("telegram_queries")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("Query status update failed:", updateError);

      return NextResponse.json(
        {
          error:
            "Notification was sent, but the query status could not be saved.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      notificationSent: true,
    });
  } catch (error) {
    console.error("Telegram query status API error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}
