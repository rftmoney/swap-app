"use client";

import { telegramBotAvailable, telegramBotUrl } from "@/lib/telegram-public";

function TelegramIcon() {
  return (
    <svg className="nav-telegram-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M21.95 4.57a1.5 1.5 0 0 0-1.6-.25L2.9 11.13a1.25 1.25 0 0 0 .08 2.33l4.84 1.74 1.86 5.68a1.25 1.25 0 0 0 2.06.45l2.66-2.87 4.93 3.64a1.25 1.25 0 0 0 1.96-.76l3.2-16.05a1.5 1.5 0 0 0-.53-1.52ZM9.08 14.23l-.17 2.52-1.1-3.35 8.53-5.28-7.26 6.11Z"
      />
    </svg>
  );
}

export function TelegramNavLink() {
  const href = telegramBotUrl();
  if (!telegramBotAvailable() || !href) return null;

  return (
    <a
      className="nav-telegram-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Open Rift on Telegram"
    >
      <TelegramIcon />
      Telegram
    </a>
  );
}
