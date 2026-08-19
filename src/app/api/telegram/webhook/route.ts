import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram-handlers";

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const update = await request.json();
    await handleTelegramUpdate(update);
  } catch {
    // Telegram expects 200 even when a handler fails.
  }

  return NextResponse.json({ ok: true });
}
