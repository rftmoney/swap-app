/** Client-safe Telegram bot URL (no secrets). */
export function telegramBotUrl() {
  const username = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  if (!username) return null;
  return `https://t.me/${username}`;
}

export function telegramBotAvailable() {
  return Boolean(telegramBotUrl());
}
