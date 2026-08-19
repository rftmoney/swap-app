"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { telegramBotUrl } from "@/lib/telegram-public";

export function TelegramDeskLink({ className }: { className?: string }) {
  const { t } = useLanguage();
  const href = telegramBotUrl();
  if (!href) return null;

  return (
    <a
      className={className ?? "telegram-desk-link"}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      {t("telegramDesk")}
    </a>
  );
}
