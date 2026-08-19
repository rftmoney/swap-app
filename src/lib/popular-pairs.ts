export type PopularPair = {
  slug: string;
  label: string;
  from: { coin: string; network: string };
  to: { coin: string; network: string };
};

export const POPULAR_SWAP_PAIRS: PopularPair[] = [
  {
    slug: "btc-to-eth",
    label: "BTC → ETH",
    from: { coin: "btc", network: "bitcoin" },
    to: { coin: "eth", network: "ethereum" },
  },
  {
    slug: "usdt-to-sol",
    label: "USDT → SOL",
    from: { coin: "usdt", network: "ethereum" },
    to: { coin: "sol", network: "solana" },
  },
  {
    slug: "eth-to-btc",
    label: "ETH → BTC",
    from: { coin: "eth", network: "ethereum" },
    to: { coin: "btc", network: "bitcoin" },
  },
];

export const DEFAULT_FEATURED_PAIR = POPULAR_SWAP_PAIRS[0];

export function getPopularPairBySlug(slug: string): PopularPair | undefined {
  return POPULAR_SWAP_PAIRS.find((pair) => pair.slug === slug);
}

export function pairHeadline(pair: PopularPair): string {
  const from = pair.from.coin.toUpperCase();
  const to = pair.to.coin.toUpperCase();
  return `${from} → ${to}`;
}
