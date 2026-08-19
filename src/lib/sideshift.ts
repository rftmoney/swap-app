import "server-only";

import type { PairInfo, Quote, Shift, SideShiftCoin } from "@/lib/sideshift-shared";
import { clientIp as readClientIp } from "@/lib/security";

const API_BASE = "https://sideshift.ai/api/v2";

/** SideShift max affiliate cut (2%). Above 0.5% is passed through to the user rate. */
export const AFFILIATE_COMMISSION_RATE = "0.02";

function getCredentials() {
  const secret = process.env.SIDESHIFT_SECRET;
  const affiliateId = process.env.SIDESHIFT_AFFILIATE_ID;
  if (!secret || !affiliateId) {
    throw new Error("Missing SIDESHIFT_SECRET or SIDESHIFT_AFFILIATE_ID");
  }
  return { secret, affiliateId };
}

export function getAffiliateId() {
  return getCredentials().affiliateId;
}

// Upstream error strings name the liquidity provider; the UI stays unbranded.
function sanitizeMessage(message: string, status: number) {
  const clean = message.replace(/side\s*shift(\.ai)?/gi, "Rift").trim();
  return clean || `Request failed (${status})`;
}

async function sideshiftFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    userIp?: string;
    auth?: boolean;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth !== false) {
    const { secret } = getCredentials();
    headers["x-sideshift-secret"] = secret;
  }

  if (options.userIp) {
    headers["x-user-ip"] = options.userIp;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const raw =
      typeof data?.error?.message === "string"
        ? data.error.message
        : typeof data?.error === "string"
          ? data.error
          : typeof data?.message === "string"
            ? data.message
            : `Request failed (${res.status})`;
    throw new Error(sanitizeMessage(raw, res.status));
  }

  return data as T;
}

export async function listCoins() {
  return sideshiftFetch<SideShiftCoin[]>("/coins", { auth: false });
}

export type RecentShift = {
  createdAt: string;
  depositCoin: string;
  depositNetwork: string;
  depositAmount: string | null;
  settleCoin: string;
  settleNetwork: string;
  settleAmount: string | null;
};

export async function getRecentShifts(limit = 10) {
  const safeLimit = Math.min(20, Math.max(1, Math.trunc(limit)));
  return sideshiftFetch<RecentShift[]>(
    `/recent-shifts?limit=${safeLimit}`,
    { auth: false },
  );
}

export async function getPair(from: string, to: string, amount?: string) {
  const path = `/pair/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;

  try {
    const { affiliateId } = getCredentials();
    const params = new URLSearchParams({
      affiliateId,
      commissionRate: AFFILIATE_COMMISSION_RATE,
    });
    if (amount) params.set("amount", amount);
    return await sideshiftFetch<PairInfo>(`${path}?${params}`);
  } catch {
    // Missing or invalid affiliate credentials — still show a public market rate.
    const params = new URLSearchParams();
    if (amount) params.set("amount", amount);
    const qs = params.toString();
    return sideshiftFetch<PairInfo>(`${path}${qs ? `?${qs}` : ""}`, {
      auth: false,
    });
  }
}

export async function requestQuote(
  body: {
    depositCoin: string;
    depositNetwork: string;
    settleCoin: string;
    settleNetwork: string;
    depositAmount?: string | null;
    settleAmount?: string | null;
  },
  userIp: string,
) {
  const { affiliateId } = getCredentials();
  return sideshiftFetch<Quote>("/quotes", {
    method: "POST",
    userIp,
    body: {
      ...body,
      affiliateId,
      commissionRate: AFFILIATE_COMMISSION_RATE,
    },
  });
}

export async function createFixedShift(
  body: {
    quoteId: string;
    settleAddress: string;
    settleMemo?: string;
    refundAddress?: string;
    refundMemo?: string;
  },
  userIp: string,
) {
  const { affiliateId } = getCredentials();
  return sideshiftFetch<Shift>("/shifts/fixed", {
    method: "POST",
    userIp,
    body: {
      ...body,
      affiliateId,
      commissionRate: AFFILIATE_COMMISSION_RATE,
    },
  });
}

export async function createVariableShift(
  body: {
    depositCoin: string;
    depositNetwork: string;
    settleCoin: string;
    settleNetwork: string;
    settleAddress: string;
    settleMemo?: string;
    refundAddress?: string;
    refundMemo?: string;
  },
  userIp: string,
) {
  const { affiliateId } = getCredentials();
  return sideshiftFetch<Shift>("/shifts/variable", {
    method: "POST",
    userIp,
    body: {
      ...body,
      affiliateId,
      commissionRate: AFFILIATE_COMMISSION_RATE,
    },
  });
}

export async function getShift(shiftId: string) {
  return sideshiftFetch<Shift>(`/shifts/${encodeURIComponent(shiftId)}`, {
    auth: false,
  });
}

function isPrivateIp(ip: string) {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "0.0.0.0" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
}

let cachedPublicIp: string | null = null;

async function resolvePublicIp() {
  if (cachedPublicIp) return cachedPublicIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json", {
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    });
    const data = (await res.json()) as { ip?: string };
    if (data.ip) {
      cachedPublicIp = data.ip;
      return data.ip;
    }
  } catch {
    /* fall through */
  }
  throw new Error("Unable to resolve client network");
}

export async function getClientIp(request: Request): Promise<string> {
  const candidate = readClientIp(request);

  if (candidate !== "unknown" && !isPrivateIp(candidate)) return candidate;
  return resolvePublicIp();
}
