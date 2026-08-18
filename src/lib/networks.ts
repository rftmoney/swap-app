const EVM_NETWORKS = new Set([
  "ethereum",
  "eth",
  "arbitrum",
  "optimism",
  "polygon",
  "base",
  "avax",
  "avalanche",
  "bsc",
  "binance-smart-chain",
  "mantle",
  "scroll",
  "linea",
  "zksync",
  "blast",
  "gnosis",
  "fantom",
  "cronos",
  "moonbeam",
  "celo",
]);

const EVM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  eth: 1,
  optimism: 10,
  bsc: 56,
  "binance-smart-chain": 56,
  polygon: 137,
  fantom: 250,
  mantle: 5000,
  base: 8453,
  avalanche: 43114,
  avax: 43114,
  arbitrum: 42161,
  linea: 59144,
  blast: 81457,
  scroll: 534352,
};

/** Unstoppable Domains TLDs commonly used for crypto addresses. */
export const UNSTOPPABLE_TLDS = new Set([
  "crypto",
  "nft",
  "wallet",
  "blockchain",
  "bitcoin",
  "dao",
  "888",
  "x",
  "hi",
  "zil",
  "klever",
  "kresus",
  "polygon",
  "anime",
  "manga",
  "binanceus",
  "go",
  "altimist",
  "pudding",
  "unstoppable",
]);

export function isEvmNetwork(network: string) {
  const value = network.toLowerCase();
  if (EVM_NETWORKS.has(value)) return true;
  return [...EVM_NETWORKS].some((item) => value.includes(item));
}

export function isSolanaNetwork(network: string) {
  const value = network.toLowerCase();
  return value === "solana" || value === "sol" || value.includes("solana");
}

export function evmChainId(network: string): number | null {
  const value = network.toLowerCase();
  if (value in EVM_CHAIN_IDS) return EVM_CHAIN_IDS[value];
  for (const [name, id] of Object.entries(EVM_CHAIN_IDS)) {
    if (value.includes(name)) return id;
  }
  return isEvmNetwork(value) ? 1 : null;
}

export function looksLikeDomainName(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed.includes(".") || trimmed.length > 128) return false;
  if (/^0x[a-f0-9]{40}$/i.test(trimmed)) return false;
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(
    trimmed,
  );
}

export function nameServiceFor(value: string): "ens" | "sns" | "unstoppable" | null {
  if (!looksLikeDomainName(value)) return null;
  const tld = value.trim().toLowerCase().split(".").pop() ?? "";
  if (tld === "eth") return "ens";
  if (tld === "sol" || tld === "sns") return "sns";
  if (UNSTOPPABLE_TLDS.has(tld)) return "unstoppable";
  return null;
}
