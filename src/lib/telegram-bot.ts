import "server-only";

export function telegramBotConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
}

export async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return false;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function registerTelegramWebhook(appOrigin: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const body: Record<string, string> = {
    url: `${appOrigin.replace(/\/$/, "")}/api/telegram/webhook`,
  };
  if (secret) body.secret_token = secret;

  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    },
  );
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description ?? "Failed to register Telegram webhook");
  }
  return data;
}
