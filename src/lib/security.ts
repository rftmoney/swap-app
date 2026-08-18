import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const COIN_RE = /^[a-z0-9]{1,24}$/i;
const NETWORK_RE = /^[a-z0-9-]{1,40}$/i;
// Broad crypto address check: hex, bech32, base58-ish — reject control chars/scripts.
const ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z0-9x]{8,128}$/;
const MEMO_RE = /^[\w .:/=+-]{0,128}$/;
const SHIFT_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;
const PAIR_ASSET_RE = /^[a-z0-9-]{1,48}$/i;

type Bucket = { count: number; resetAt: number };
type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
let lastSweep = 0;

const redisLimiters = new Map<string, Ratelimit>();
let redisClient: Redis | null | undefined;

export function clientIp(request: Request): string {
  const candidates = [
    request.headers.get("x-vercel-forwarded-for"),
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-real-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0],
  ];

  for (const candidate of candidates) {
    const normalized = normalizeIp(candidate);
    if (normalized) return normalized;
  }
  return "unknown";
}

/**
 * Shared rate limit. Uses Upstash Redis when configured (multi-instance safe on
 * Vercel). Falls back to process memory for local/dev.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (redis) {
    try {
      return await redisRateLimit(redis, key, limit, windowMs);
    } catch {
      // Shared store unavailable — degrade to local buckets rather than fail open
      // without any limit.
      return memoryRateLimit(key, limit, windowMs);
    }
  }
  return memoryRateLimit(key, limit, windowMs);
}

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redisClient = null;
    return null;
  }
  try {
    redisClient = new Redis({ url, token });
  } catch {
    redisClient = null;
  }
  return redisClient;
}

async function redisRateLimit(
  redis: Redis,
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const limiterKey = `${limit}:${windowSec}`;
  let limiter = redisLimiters.get(limiterKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "rift:rl",
      analytics: false,
    });
    redisLimiters.set(limiterKey, limiter);
  }

  const result = await limiter.limit(key);
  if (result.success) return { ok: true };
  return {
    ok: false,
    retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
  };
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweepBuckets(now);
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

export function rateLimitedResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests. Try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    },
  );
}

export function assertSameOrigin(request: Request): boolean {
  let host = request.headers.get("host");
  const canonicalOrigin = process.env.APP_ORIGIN;
  if (canonicalOrigin) {
    try {
      host = new URL(canonicalOrigin).host;
    } catch {
      return false;
    }
  }
  if (!host) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  // Same-origin navigations / some clients send Referer instead of Origin.
  const referer = request.headers.get("referer");
  if (!referer) {
    // Allow server-to-server health checks only when neither is present in non-browser contexts.
    // For browser POSTs we require Origin or Referer.
    return false;
  }

  try {
    return new URL(referer).host === host;
  } catch {
    return false;
  }
}

export function sanitizeCoin(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return COIN_RE.test(trimmed) ? trimmed.toLowerCase() : null;
}

export function sanitizeNetwork(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return NETWORK_RE.test(trimmed) ? trimmed : null;
}

export function sanitizeAddress(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < 8 || trimmed.length > 128) return null;
  if (!ADDRESS_RE.test(trimmed)) return null;
  // Block obvious XSS / injection payloads even if regex slipped.
  if (/[<>"'`\\]/.test(trimmed)) return null;
  return trimmed;
}

export function sanitizeMemo(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!MEMO_RE.test(trimmed)) return undefined;
  return trimmed;
}

export function sanitizePairAsset(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return PAIR_ASSET_RE.test(trimmed) ? trimmed : null;
}

export function sanitizeShiftId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return SHIFT_ID_RE.test(trimmed) ? trimmed : null;
}

export function sanitizeAmount(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const raw = String(value).trim();
  if (!/^\d+(\.\d{1,18})?$/.test(raw)) return undefined;
  const num = Number(raw);
  if (!Number.isFinite(num) || num <= 0 || num > 1e12) return undefined;
  return raw;
}

export async function readJsonBody<T>(
  request: Request,
  maxBytes = 8_192,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return { ok: false, error: "Content-Type must be application/json" };
  }

  const lengthHeader = request.headers.get("content-length");
  const declaredLength = lengthHeader ? Number(lengthHeader) : null;
  if (
    declaredLength !== null &&
    (!Number.isFinite(declaredLength) ||
      declaredLength < 0 ||
      declaredLength > maxBytes)
  ) {
    return { ok: false, error: "Payload too large" };
  }

  if (!request.body) {
    return { ok: false, error: "Invalid JSON" };
  }

  try {
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let received = 0;
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel();
        return { ok: false, error: "Payload too large" };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();

    const data: unknown = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, error: "JSON body must be an object" };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
}

function normalizeIp(value: string | null | undefined): string | null {
  if (!value) return null;
  const candidate = value.trim().replace(/^\[|\]$/g, "");
  if (!candidate || candidate.length > 64) return null;

  const ipv4 = candidate.match(/^(\d{1,3}\.){3}\d{1,3}$/);
  if (ipv4 && candidate.split(".").every((part) => Number(part) <= 255)) {
    return candidate;
  }

  // Header values may contain IPv6; only accept its hexadecimal grammar.
  if (/^[0-9a-f:]+$/i.test(candidate) && candidate.includes(":")) {
    return candidate.toLowerCase();
  }
  return null;
}

function sweepBuckets(now: number) {
  if (now - lastSweep < 60_000 && buckets.size < MAX_BUCKETS) return;
  lastSweep = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  if (buckets.size >= MAX_BUCKETS) {
    // Bound process memory under spoofed-IP floods. The shared fallback bucket
    // remains rate limited while upstream edge protection absorbs the attack.
    buckets.clear();
  }
}

/** Strip fields we never need to expose to the browser. */
export function publicShift<T extends Record<string, unknown>>(shift: T) {
  const {
    // Keep intentional allowlist below; drop unexpected extras.
    id,
    createdAt,
    depositCoin,
    settleCoin,
    depositNetwork,
    settleNetwork,
    depositAddress,
    depositMemo,
    settleAddress,
    settleMemo,
    depositAmount,
    settleAmount,
    depositMin,
    depositMax,
    rate,
    status,
    expiresAt,
    type,
    averageShiftSeconds,
  } = shift as Record<string, unknown>;

  return {
    id,
    createdAt,
    depositCoin,
    settleCoin,
    depositNetwork,
    settleNetwork,
    depositAddress,
    depositMemo: depositMemo ?? null,
    settleAddress,
    settleMemo: settleMemo ?? null,
    depositAmount,
    settleAmount,
    depositMin,
    depositMax,
    rate,
    status,
    expiresAt,
    type,
    averageShiftSeconds,
  };
}
