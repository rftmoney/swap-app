/** Client-safe Telegram bot URL (no secrets). */
export function telegramBotUsername() {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "") ?? null;
}

export function telegramBotUrl() {
  const username = telegramBotUsername();
  if (!username) return null;
  return `https://t.me/${username}`;
}

export function telegramBotAvailable() {
  return Boolean(telegramBotUrl());
}
