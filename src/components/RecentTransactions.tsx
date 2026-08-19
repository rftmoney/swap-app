"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { coinIconUrl } from "@/lib/sideshift-shared";

type RecentTransaction = {
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  depositAmount: string | null;
  settleCoin: string;
  settleNetwork: string;
  settleAmount: string | null;
};

export function RecentTransactions() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let active = true;

    async function update() {
      try {
        const response = await fetch("/api/recent");
        const data = await response.json();
        if (!active) return;
        if (!response.ok || !Array.isArray(data)) return;
        const sorted = [...data].sort(
          (a: RecentTransaction, b: RecentTransaction) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setTransactions(sorted);
        setNow(Date.now());
      } catch {
        /* keep last successful snapshot */
      }
    }

    void update();
    const fetchInterval = window.setInterval(update, 30_000);
    const tickInterval = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => {
      active = false;
      window.clearInterval(fetchInterval);
      window.clearInterval(tickInterval);
    };
  }, []);

  return (
    <section className="recent-section" aria-labelledby="recent-title">
      <header className="section-heading">
        <div>
          <p>{t("tape")}</p>
          <h2 id="recent-title">{t("recentTransactions")}</h2>
        </div>
        <span className="live-label">
          <i aria-hidden />
          {t("live")}
        </span>
      </header>

      <div className="recent-table">
        <div className="recent-row recent-table-head" aria-hidden>
          <span>{t("sent")}</span>
          <span>{t("route")}</span>
          <span>{t("received")}</span>
          <span>{t("time")}</span>
        </div>

        {transactions.length
          ? transactions.map((transaction, index) => (
              <TransactionRow
                transaction={transaction}
                now={now}
                privateLabel={t("private")}
                key={`${transaction.createdAt}-${transaction.depositCoin}-${transaction.settleCoin}-${index}`}
              />
            ))
          : Array.from({ length: 5 }, (_, index) => (
              <div className="recent-row recent-skeleton" key={index}>
                <span />
                <span />
                <span />
                <span />
              </div>
            ))}
      </div>
    </section>
  );
}

function TransactionRow({
  transaction,
  now,
  privateLabel,
}: {
  transaction: RecentTransaction;
  now: number;
  privateLabel: string;
}) {
  const privateAmount =
    transaction.depositAmount === null || transaction.settleAmount === null;

  return (
    <div className="recent-row">
      <AssetAmount
        coin={transaction.depositCoin}
        amount={transaction.depositAmount}
        privateAmount={privateAmount}
        privateLabel={privateLabel}
      />
      <span
        className="transaction-route"
        title={`${transaction.depositNetwork} → ${transaction.settleNetwork}`}
      >
        {transaction.depositNetwork}
        <b aria-hidden>→</b>
        {transaction.settleNetwork}
      </span>
      <AssetAmount
        coin={transaction.settleCoin}
        amount={transaction.settleAmount}
        privateAmount={privateAmount}
        privateLabel={privateLabel}
      />
      <time
        dateTime={transaction.createdAt}
        title={clockTime(transaction.createdAt)}
      >
        {relativeTime(transaction.createdAt, now)}
      </time>
    </div>
  );
}

function AssetAmount({
  coin,
  amount,
  privateAmount,
  privateLabel,
}: {
  coin: string;
  amount: string | null;
  privateAmount: boolean;
  privateLabel: string;
}) {
  return (
    <span className="transaction-asset">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coinIconUrl(coin)} alt="" width={22} height={22} />
      <span>
        <strong>{coin.toUpperCase()}</strong>
        <small>{privateAmount ? privateLabel : formatAmount(amount)}</small>
      </span>
    </span>
  );
}

function formatAmount(amount: string | null) {
  if (!amount) return "—";
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(value);
}

function clockTime(value: string) {
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return "--:--:--";
  return created.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function relativeTime(value: string, now = Date.now()) {
  const created = new Date(value).getTime();
  if (!Number.isFinite(created)) return "—";

  const diffSeconds = Math.max(0, Math.floor((now - created) / 1000));
  if (diffSeconds < 45) return "just now";
  if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffSeconds / 86400);
  return `${days}d ago`;
}
