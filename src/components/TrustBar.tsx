"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type PlatformStats = {
  assetCount: number;
  recentShifts24h: number | null;
  averageSettlementMinutes: number;
};

export function TrustBar() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/stats");
        const data = (await response.json()) as PlatformStats;
        if (active && response.ok) setStats(data);
      } catch {
        /* keep defaults in copy */
      }
    }

    void load();
  }, []);

  const assets = stats?.assetCount ?? 200;
  const settlement = stats?.averageSettlementMinutes ?? 4;
  const recent = stats?.recentShifts24h;

  return (
    <div className="trust-bar" role="contentinfo" aria-label="Platform trust signals">
      <p className="trust-bar-primary">
        <span>{t("nonCustodial")}</span>
        <span aria-hidden>·</span>
        <span>{t("noKyc")}</span>
        <span aria-hidden>·</span>
        <span>{t("assetCount", { count: String(assets) })}</span>
      </p>
      <p className="trust-bar-secondary">
        {t("typicalSettlement", { minutes: String(settlement) })}
        {recent !== null && recent !== undefined ? (
          <>
            <span aria-hidden> · </span>
            {t("recentShifts24h", { count: String(recent) })}
          </>
        ) : null}
      </p>
    </div>
  );
}
