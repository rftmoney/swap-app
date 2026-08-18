"use client";

import { useEffect, useState } from "react";
import { coinIconUrl } from "@/lib/sideshift-shared";

type MarketPrice = {
  symbol: string;
  price: number;
  change24h: number | null;
};

const PLACEHOLDERS = [
  "BTC",
  "ETH",
  "SOL",
  "LTC",
  "XMR",
  "DOGE",
  "XRP",
  "ADA",
  "BNB",
  "AVAX",
  "DOT",
  "LINK",
].map((symbol) => ({ symbol, price: null, change24h: null }));

export function MarketTicker() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);

  useEffect(() => {
    let active = true;

    async function updatePrices() {
      try {
        const response = await fetch("/api/prices");
        const data = (await response.json()) as { prices?: MarketPrice[] };
        if (active && response.ok && data.prices?.length) {
          setPrices(data.prices);
        }
      } catch {
        // Keep the last successful market snapshot.
      }
    }

    void updatePrices();
    const interval = window.setInterval(updatePrices, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const items = prices.length ? prices : PLACEHOLDERS;

  return (
    <aside className="market-ticker" aria-label="Cryptocurrency market prices">
      <div className="ticker-track">
        <TickerGroup items={items} />
        <TickerGroup items={items} hidden />
      </div>
    </aside>
  );
}

function TickerGroup({
  items,
  hidden = false,
}: {
  items: Array<{
    symbol: string;
    price: number | null;
    change24h: number | null;
  }>;
  hidden?: boolean;
}) {
  return (
    <div className="ticker-group" aria-hidden={hidden || undefined}>
      {items.map((item) => {
        const positive = item.change24h !== null && item.change24h >= 0;
        return (
          <span className="ticker-item" key={item.symbol}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coinIconUrl(item.symbol.toLowerCase())}
              alt=""
              width={16}
              height={16}
            />
            <strong>{item.symbol}</strong>
            <span>{formatPrice(item.price)}</span>
            <small
              className={
                item.change24h === null
                  ? ""
                  : positive
                    ? "is-positive"
                    : "is-negative"
              }
            >
              {item.change24h === null ? "" : positive ? "▲" : "▼"}
              {formatChange(item.change24h)}
            </small>
            <em aria-hidden>/</em>
          </span>
        );
      })}
    </div>
  );
}

function formatPrice(price: number | null) {
  if (price === null) return "$—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  }).format(price);
}

function formatChange(change: number | null) {
  if (change === null) return "—";
  return `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
}
