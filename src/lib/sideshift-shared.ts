export type SideShiftCoin = {
  coin: string;
  name: string;
  networks: string[];
  fixedOnly: boolean | string[];
  variableOnly: boolean | string[];
  networksWithMemo?: string[];
  tokenDetails?: Record<string, { contractAddress: string; decimals: number }>;
};

export type PairInfo = {
  min: string;
  max: string;
  rate: string;
  depositCoin: string;
  settleCoin: string;
  depositNetwork: string;
  settleNetwork: string;
  networkFeeUsd?: string;
  settleCoinNetworkFee?: string;
};

export type Quote = {
  id: string;
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  depositAmount: string;
  settleAmount: string;
  rate: string;
  expiresAt: string;
};

export type Shift = {
  id: string;
  pollToken?: string;
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  settleCoin: string;
  settleNetwork: string;
  type?: "fixed" | "variable";
  depositAmount?: string;
  settleAmount?: string;
  depositMin?: string;
  depositMax?: string;
  depositAddress: string;
  depositMemo?: string | null;
  settleAddress: string;
  settleMemo?: string | null;
  refundAddress?: string | null;
  rate?: string;
  status: string;
  expiresAt?: string;
};

const API_BASE = "https://sideshift.ai/api/v2";

export function coinIconUrl(coin: string) {
  return `${API_BASE}/coins/icon/${encodeURIComponent(coin)}`;
}

const PREFERRED_NETWORKS = [
  "ethereum",
  "bitcoin",
  "solana",
  "tron",
  "bsc",
  "polygon",
  "mainnet",
  "arbitrum",
  "base",
];

export function pickPreferredNetwork(networks: string[]) {
  for (const preferred of PREFERRED_NETWORKS) {
    if (networks.includes(preferred)) return preferred;
  }
  return networks[0] ?? "mainnet";
}

export function formatPairAsset(coin: string, network: string) {
  const net = network.toLowerCase();
  if (!net || net === "mainnet" || net === coin.toLowerCase()) {
    return coin.toLowerCase();
  }
  return `${coin.toLowerCase()}-${net}`;
}
