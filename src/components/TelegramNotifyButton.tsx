"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { Shift } from "@/lib/sideshift-shared";

export function TelegramNotifyButton({ shift }: { shift: Shift }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!shift.pollToken) return null;

  async function connect() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/telegram/link?shiftId=${encodeURIComponent(shift.id)}`,
        {
          headers: { "x-rift-shift-token": shift.pollToken as string },
        },
      );
      const data = (await response.json()) as {
        configured?: boolean;
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.configured || !data.url) {
        throw new Error(data.error || t("telegramNotifyUnavailable"));
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("telegramNotifyUnavailable"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="telegram-notify">
      <button
        type="button"
        className="secondary-btn telegram-notify-btn"
        disabled={loading}
        onClick={connect}
      >
        {loading ? t("telegramNotifyOpening") : t("telegramNotify")}
      </button>
      <p className="telegram-notify-hint">{t("telegramNotifyHint")}</p>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
