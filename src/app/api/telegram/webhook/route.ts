import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram-bot";
import {
  linkTelegramChat,
  telegramWelcomeMessage,
} from "@/lib/telegram-notify";

type TelegramUpdate = {
  message?: {
    chat?: { id?: number };
    text?: string;
  };
};

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim() ?? "";
  if (!chatId || !text.startsWith("/start")) {
    return NextResponse.json({ ok: true });
  }

  const payload = text.split(/\s+/)[1] ?? "";
  if (!payload.startsWith("notify_")) {
    await sendTelegramMessage(
      String(chatId),
      "Send /start from a Rift swap page to enable completion alerts.",
    );
    return NextResponse.json({ ok: true });
  }

  const token = payload.slice("notify_".length);
  const shiftId = await linkTelegramChat(token, chatId);
  if (!shiftId) {
    await sendTelegramMessage(
      String(chatId),
      "This alert link expired. Open a new one from your active Rift swap.",
    );
    return NextResponse.json({ ok: true });
  }

  await sendTelegramMessage(String(chatId), telegramWelcomeMessage());
  return NextResponse.json({ ok: true });
}
