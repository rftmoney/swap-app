import { telegramBotUrl } from "@/lib/telegram-public";

const supportTelegramUrl = () =>
  process.env.NEXT_PUBLIC_RIFT_TELEGRAM_URL?.trim() || telegramBotUrl();

export function SupportLink({ label = "Telegram support" }: { label?: string }) {
  const telegramUrl = supportTelegramUrl();
  if (!telegramUrl || !/^https:\/\/t\.me\/[a-zA-Z0-9_]+$/.test(telegramUrl)) {
    return null;
  }

  return (
    <a
      className="support-link"
      href={telegramUrl}
      target="_blank"
      rel="noreferrer noopener"
    >
      {label} ↗
    </a>
  );
}
