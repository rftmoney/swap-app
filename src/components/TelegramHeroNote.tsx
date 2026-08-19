"use client";

import { TelegramDeskLink } from "@/components/TelegramDeskLink";
import { useLanguage } from "@/components/LanguageProvider";
import { telegramBotAvailable } from "@/lib/telegram-public";

export function TelegramHeroNote() {
  const { t } = useLanguage();

  if (!telegramBotAvailable()) return null;

  return (
    <aside className="hero-telegram" aria-label="Rift on Telegram">
      <p className="hero-telegram-kicker">{t("telegramHeroKicker")}</p>
      <TelegramDeskLink className="hero-telegram-link" />
    </aside>
  );
}
