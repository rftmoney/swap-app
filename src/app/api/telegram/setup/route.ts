import { NextResponse } from "next/server";
import { configureTelegramBot } from "@/lib/telegram-bot-setup";
import { telegramBotConfigured } from "@/lib/telegram-bot";

function authorized(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!telegramBotConfigured()) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN is not configured" },
      { status: 503 },
    );
  }

  try {
    const result = await configureTelegramBot();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Setup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
