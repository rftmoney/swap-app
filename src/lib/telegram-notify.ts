import "server-only";

import { randomBytes } from "node:crypto";
import { Redis } from "@upstash/redis";
import { siteOrigin } from "@/lib/site-url";
import { sendTelegramMessage, telegramBotConfigured } from "@/lib/telegram-bot";

const PENDING_PREFIX = "tg:pending:";
const CHAT_PREFIX = "tg:chat:";
const SENT_PREFIX = "tg:sent:";

const PENDING_TTL_SEC = 3600;
const WATCH_TTL_SEC = 604_800;

type MemoryEntry = { value: string; expiresAt: number };

const memoryPending = new Map<string, MemoryEntry>();
const memoryChat = new Map<string, MemoryEntry>();
const memorySent = new Map<string, MemoryEntry>();

let redisClient: Redis | null | undefined;

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

function memoryGet(map: Map<string, MemoryEntry>, key: string) {
  const entry = map.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    map.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet(
  map: Map<string, MemoryEntry>,
  key: string,
  value: string,
  ttlSec: number,
) {
  map.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

async function kvSet(key: string, value: string, ttlSec: number) {
  const redis = getRedis();
  if (redis) {
    await redis.set(key, value, { ex: ttlSec });
    return;
  }
  const map = key.startsWith(PENDING_PREFIX)
    ? memoryPending
    : key.startsWith(CHAT_PREFIX)
      ? memoryChat
      : memorySent;
  memorySet(map, key, value, ttlSec);
}

async function kvGet(key: string) {
  const redis = getRedis();
  if (redis) {
    const value = await redis.get<string>(key);
    return value ?? null;
  }
  const map = key.startsWith(PENDING_PREFIX)
    ? memoryPending
    : key.startsWith(CHAT_PREFIX)
      ? memoryChat
      : memorySent;
  return memoryGet(map, key);
}

export function telegramNotifyConfigured() {
  return telegramBotConfigured();
}

export function telegramBotUsername() {
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "") ?? null;
}

export async function createTelegramNotifyLink(shiftId: string) {
  const username = telegramBotUsername();
  if (!username || !telegramNotifyConfigured()) {
    return null;
  }

  const token = randomBytes(9).toString("base64url");
  await kvSet(`${PENDING_PREFIX}${token}`, shiftId, PENDING_TTL_SEC);
  return `https://t.me/${username}?start=notify_${token}`;
}

export async function linkTelegramChat(startToken: string, chatId: number) {
  const shiftId = await kvGet(`${PENDING_PREFIX}${startToken}`);
  if (!shiftId) return null;

  await kvSet(`${CHAT_PREFIX}${shiftId}`, String(chatId), WATCH_TTL_SEC);
  return shiftId;
}

export async function getTelegramChatId(shiftId: string) {
  return kvGet(`${CHAT_PREFIX}${shiftId}`);
}

type NotifyShift = {
  id: string;
  status?: string;
  depositCoin?: string;
  settleCoin?: string;
  depositAmount?: string;
  settleAmount?: string;
};

export async function maybeNotifyShiftUpdate(shift: NotifyShift) {
  if (!telegramNotifyConfigured()) return;
  const status = shift.status?.toLowerCase();
  if (status !== "settled") return;

  const sentKey = `${SENT_PREFIX}${shift.id}`;
  if (await kvGet(sentKey)) return;

  const chatId = await getTelegramChatId(shift.id);
  if (!chatId) return;

  const from = shift.depositCoin?.toUpperCase() ?? "?";
  const to = shift.settleCoin?.toUpperCase() ?? "?";
  const origin = siteOrigin();
  const tracking = `${origin}/rift/${encodeURIComponent(shift.id)}`;

  const amountLine =
    shift.depositAmount && shift.settleAmount
      ? `${shift.depositAmount} ${from} → ${shift.settleAmount} ${to}`
      : `${from} → ${to}`;

  const text = [
    "✅ Rift Completed",
    "",
    amountLine,
    "Funds were sent to your wallet.",
    "",
    `Track: ${tracking}`,
  ].join("\n");

  const ok = await sendTelegramMessage(chatId, text);
  if (ok) {
    await kvSet(sentKey, "1", WATCH_TTL_SEC);
  }
}
