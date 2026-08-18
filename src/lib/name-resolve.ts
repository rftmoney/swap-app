import "server-only";
import { Connection } from "@solana/web3.js";
import { resolve as resolveSnsDomain } from "@bonfida/spl-name-service";
import {
  isEvmNetwork,
  isSolanaNetwork,
  looksLikeDomainName,
  nameServiceFor,
} from "@/lib/networks";

export type ResolvedName = {
  name: string;
  address: string;
  service: "ens" | "sns" | "unstoppable";
};

const NAME_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const SOL_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const UD_RECORD_KEYS = [
  "crypto.ETH.address",
  "crypto.ETH.version.ERC20.address",
  "crypto.MATIC.version.ERC20.address",
  "crypto.AVAX.version.ERC20.address",
  "crypto.BNB.version.BEP20.address",
  "crypto.SOL.address",
  "crypto.BTC.address",
  "crypto.LTC.address",
  "crypto.XRP.address",
  "crypto.ADA.address",
  "crypto.DOT.address",
  "crypto.ATOM.address",
] as const;

export async function resolveDomainName(options: {
  name: string;
  coin?: string;
  network?: string;
}): Promise<ResolvedName> {
  const name = options.name.trim().toLowerCase();
  if (!looksLikeDomainName(name) || !NAME_RE.test(name) || name.length > 128) {
    throw new ResolveError("Enter a valid name like name.eth or name.sol");
  }

  const service = nameServiceFor(name);
  if (!service) {
    throw new ResolveError("Unsupported name service for this domain");
  }

  if (service === "ens") {
    if (options.network && !isEvmNetwork(options.network)) {
      throw new ResolveError("ENS names resolve to EVM addresses");
    }
    const address = await resolveEns(name);
    return { name, address, service };
  }

  if (service === "sns") {
    if (options.network && !isSolanaNetwork(options.network)) {
      throw new ResolveError("SNS names resolve to Solana addresses");
    }
    const address = await resolveSns(name);
    return { name, address, service };
  }

  const address = await resolveUnstoppable(name, options.coin, options.network);
  return { name, address, service };
}

async function resolveEns(name: string) {
  const response = await fetch(
    `https://api.ensdata.net/${encodeURIComponent(name)}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    },
  );
  if (response.status === 404) {
    throw new ResolveError("ENS name not found");
  }
  if (!response.ok) {
    throw new ResolveError("ENS lookup failed");
  }
  const data = (await response.json()) as {
    address?: string;
    wallets?: { eth?: string };
  };
  const address = data.address || data.wallets?.eth;
  if (!address || !EVM_ADDRESS_RE.test(address)) {
    throw new ResolveError("ENS name has no ETH address");
  }
  return address;
}

async function resolveSns(name: string) {
  const endpoint =
    process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
  const connection = new Connection(endpoint, {
    commitment: "confirmed",
    disableRetryOnRateLimit: true,
  });

  const candidates = buildSnsCandidates(name);
  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      const key = await resolveSnsDomain(connection, candidate, {
        allowPda: false,
      });
      const address = key.toBase58();
      if (!SOL_ADDRESS_RE.test(address)) {
        throw new ResolveError("SNS name has no Solana owner");
      }
      return address;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof ResolveError) throw lastError;
  throw new ResolveError("SNS name not found or unavailable");
}

function buildSnsCandidates(name: string) {
  const normalized = name.trim().toLowerCase();
  if (normalized.endsWith(".sol") || normalized.endsWith(".sns")) {
    const base = normalized.replace(/\.(sol|sns)$/i, "");
    return [`${base}.sns`, `${base}.sol`, normalized];
  }
  return [`${normalized}.sns`, `${normalized}.sol`];
}

async function resolveUnstoppable(
  name: string,
  coin?: string,
  network?: string,
) {
  const apiKey = process.env.UNSTOPPABLE_API_KEY;
  if (!apiKey) {
    throw new ResolveError(
      "Unstoppable Domains is not configured on this server yet",
    );
  }

  const params = new URLSearchParams();
  for (const key of UD_RECORD_KEYS) {
    params.append("resolutionKeys[]", key);
  }

  const response = await fetch(
    `https://api.unstoppabledomains.com/resolve/domains/${encodeURIComponent(name)}?${params}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    throw new ResolveError("Unstoppable domain not found");
  }
  if (!response.ok) {
    throw new ResolveError("Unstoppable lookup failed");
  }

  const data = (await response.json()) as {
    records?: Record<string, string | null | undefined>;
  };
  const records = data.records ?? {};
  const preferred = preferredUdKeys(coin, network);
  for (const key of preferred) {
    const value = records[key];
    if (typeof value === "string" && value.length >= 8) {
      return value;
    }
  }

  throw new ResolveError("Unstoppable domain has no matching crypto address");
}

function preferredUdKeys(coin?: string, network?: string) {
  const symbol = (coin ?? "").toUpperCase();
  const net = (network ?? "").toLowerCase();
  const keys: string[] = [];

  if (symbol === "ETH" || isEvmNetwork(net)) {
    keys.push("crypto.ETH.address", "crypto.ETH.version.ERC20.address");
  }
  if (symbol === "SOL" || isSolanaNetwork(net)) {
    keys.push("crypto.SOL.address");
  }
  if (symbol === "MATIC" || net.includes("polygon")) {
    keys.push("crypto.MATIC.version.ERC20.address");
  }
  if (symbol === "BNB" || net.includes("bsc")) {
    keys.push("crypto.BNB.version.BEP20.address");
  }
  if (symbol === "AVAX" || net.includes("avax") || net.includes("avalanche")) {
    keys.push("crypto.AVAX.version.ERC20.address");
  }
  if (symbol) {
    keys.push(`crypto.${symbol}.address`);
  }

  keys.push(...UD_RECORD_KEYS);
  return [...new Set(keys)];
}

export class ResolveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResolveError";
  }
}
