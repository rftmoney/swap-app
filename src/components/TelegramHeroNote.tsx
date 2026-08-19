"use client";

import { TelegramDeskLink } from "@/components/TelegramDeskLink";
import { useLanguage } from "@/components/LanguageProvider";
import { telegramBotAvailable, telegramBotUsername } from "@/lib/telegram-public";

export function TelegramHeroNote() {
  const { t } = useLanguage();
  const bot = telegramBotUsername();

  if (!telegramBotAvailable()) return null;

  return (
    <aside className="hero-telegram" aria-label="Rift on Telegram">
      <p className="hero-telegram-kicker">{t("telegramHeroKicker")}</p>
      <p className="hero-telegram-body">
        {t("telegramHeroBody", { bot: bot ? `@${bot}` : "Telegram" })}
      </p>
      <TelegramDeskLink className="hero-telegram-link" />
    </aside>
  );
}
