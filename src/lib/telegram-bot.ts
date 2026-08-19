import "server-only";

import { siteOrigin } from "@/lib/site-url";

export type TelegramInlineKeyboard = {
  inline_keyboard: Array<
    Array<{
      text: string;
      url?: string;
      web_app?: { url: string };
      callback_data?: string;
    }>
  >;
};

type TelegramApiResponse = {
  ok: boolean;
  description?: string;
  result?: unknown;
};

export function telegramBotConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
}

export function telegramMiniAppUrl() {
  return `${siteOrigin()}/telegram`;
}

export function telegramBotProfileUrl() {
  const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
  return username ? `https://t.me/${username}` : siteOrigin();
}

async function telegramCall<T = unknown>(
  method: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });

  const data = (await response.json()) as TelegramApiResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.description ?? `Telegram API ${method} failed`);
  }
  return data.result as T;
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: {
    replyMarkup?: TelegramInlineKeyboard;
    parseMode?: "HTML" | "Markdown";
  },
) {
  if (!telegramBotConfigured()) return false;

  try {
    await telegramCall("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: options?.parseMode,
      disable_web_page_preview: true,
      reply_markup: options?.replyMarkup,
    });
    return true;
  } catch {
    return false;
  }
}

export function telegramBotAvatarUrl() {
  return `${siteOrigin()}/bot-avatar.png`;
}

export async function sendTelegramPhoto(
  chatId: string | number,
  photoUrl: string,
  options?: {
    caption?: string;
    replyMarkup?: TelegramInlineKeyboard;
    parseMode?: "HTML" | "Markdown";
  },
) {
  if (!telegramBotConfigured()) return false;

  try {
    await telegramCall("sendPhoto", {
      chat_id: chatId,
      photo: photoUrl,
      caption: options?.caption,
      parse_mode: options?.parseMode,
      reply_markup: options?.replyMarkup,
    });
    return true;
  } catch {
    return false;
  }
}

export async function answerTelegramCallback(
  callbackQueryId: string,
  text?: string,
) {
  if (!telegramBotConfigured()) return false;
  try {
    await telegramCall("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text,
      show_alert: Boolean(text),
    });
    return true;
  } catch {
    return false;
  }
}

export async function registerTelegramWebhook(appOrigin: string) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const body: Record<string, unknown> = {
    url: `${appOrigin.replace(/\/$/, "")}/api/telegram/webhook`,
    allowed_updates: ["message", "callback_query"],
  };
  if (secret) body.secret_token = secret;
  return telegramCall("setWebhook", body);
}

export { telegramCall };
