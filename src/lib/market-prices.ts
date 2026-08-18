import "server-only";

export type MarketPrice = {
  symbol: string;
  price: number;
  change24h: number | null;
};

export type MarketSnapshot = {
  prices: MarketPrice[];
  updatedAt: string;
  source: "coingecko" | "binance";
};

const ASSETS = [
  { id: "bitcoin", symbol: "BTC", binance: "BTCUSDT" },
  { id: "ethereum", symbol: "ETH", binance: "ETHUSDT" },
  { id: "solana", symbol: "SOL", binance: "SOLUSDT" },
  { id: "litecoin", symbol: "LTC", binance: "LTCUSDT" },
  { id: "monero", symbol: "XMR", binance: "XMRUSDT" },
  { id: "dogecoin", symbol: "DOGE", binance: "DOGEUSDT" },
  { id: "ripple", symbol: "XRP", binance: "XRPUSDT" },
  { id: "cardano", symbol: "ADA", binance: "ADAUSDT" },
  { id: "binancecoin", symbol: "BNB", binance: "BNBUSDT" },
  { id: "avalanche-2", symbol: "AVAX", binance: "AVAXUSDT" },
  { id: "polkadot", symbol: "DOT", binance: "DOTUSDT" },
  { id: "chainlink", symbol: "LINK", binance: "LINKUSDT" },
] as const;

export async function fetchMarketSnapshot(): Promise<MarketSnapshot> {
  const errors: string[] = [];

  try {
    return await fromCoinGecko();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "coingecko");
  }

  try {
    return await fromBinance();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "binance");
  }

  throw new Error(`All market feeds failed (${errors.join("; ")})`);
}

async function fromCoinGecko(): Promise<MarketSnapshot> {
  const ids = ASSETS.map((asset) => asset.id).join(",");
  const params = new URLSearchParams({
    ids,
    vs_currencies: "usd",
    include_24hr_change: "true",
  });
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?${params}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 60 },
    },
  );
  if (!response.ok) throw new Error(`coingecko ${response.status}`);

  const market = (await response.json()) as Record<
    string,
    { usd?: number; usd_24h_change?: number }
  >;

  const prices = ASSETS.flatMap(({ id, symbol }) => {
    const entry = market[id];
    if (typeof entry?.usd !== "number") return [];
    return [
      {
        symbol,
        price: entry.usd,
        change24h:
          typeof entry.usd_24h_change === "number"
            ? entry.usd_24h_change
            : null,
      },
    ];
  });

  if (prices.length < 4) throw new Error("coingecko incomplete");
  return {
    prices,
    updatedAt: new Date().toISOString(),
    source: "coingecko",
  };
}

async function fromBinance(): Promise<MarketSnapshot> {
  const symbols = ASSETS.map((asset) => `"${asset.binance}"`).join(",");
  const response = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 60 },
    },
  );
  if (!response.ok) throw new Error(`binance ${response.status}`);

  const rows = (await response.json()) as Array<{
    symbol?: string;
    lastPrice?: string;
    priceChangePercent?: string;
  }>;

  const bySymbol = new Map(
    rows
      .filter((row) => typeof row.symbol === "string")
      .map((row) => [row.symbol as string, row]),
  );

  const prices = ASSETS.flatMap(({ symbol, binance }) => {
    const row = bySymbol.get(binance);
    const price = Number(row?.lastPrice);
    if (!Number.isFinite(price) || price <= 0) return [];
    const change = Number(row?.priceChangePercent);
    return [
      {
        symbol,
        price,
        change24h: Number.isFinite(change) ? change : null,
      },
    ];
  });

  if (prices.length < 4) throw new Error("binance incomplete");
  return {
    prices,
    updatedAt: new Date().toISOString(),
    source: "binance",
  };
}
