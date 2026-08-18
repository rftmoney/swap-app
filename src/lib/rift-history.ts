import type { Shift } from "@/lib/sideshift-shared";

const STORAGE_KEY = "rift-recovery-v1";
const ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;
const TOKEN_RE = /^[a-zA-Z0-9_-]{32,128}$/;

export type SavedRift = {
  id: string;
  pollToken: string;
  createdAt: string;
  depositCoin?: string;
  settleCoin?: string;
};

export function saveRift(shift: Shift) {
  if (!validId(shift.id) || !validToken(shift.pollToken)) return;
  const current = readRifts().filter((item) => item.id !== shift.id);
  current.unshift({
    id: shift.id,
    pollToken: shift.pollToken,
    createdAt: shift.createdAt || new Date().toISOString(),
    depositCoin: shift.depositCoin,
    settleCoin: shift.settleCoin,
  });
  writeRifts(current.slice(0, 20));
}

export function saveRecoveryToken(id: string, pollToken: string) {
  if (!validId(id) || !validToken(pollToken)) return false;
  const existing = readRifts().find((item) => item.id === id);
  saveRift({
    id,
    pollToken,
    createdAt: existing?.createdAt || new Date().toISOString(),
    depositCoin: existing?.depositCoin || "",
    settleCoin: existing?.settleCoin || "",
    depositNetwork: "",
    settleNetwork: "",
    depositAddress: "",
    settleAddress: "",
    status: "unknown",
  });
  return true;
}

export function getRecoveryToken(id: string) {
  if (!validId(id)) return null;
  return readRifts().find((item) => item.id === id)?.pollToken ?? null;
}

export function readRifts(): SavedRift[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "[]",
    );
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedRift).slice(0, 20);
  } catch {
    return [];
  }
}

export function privateRiftUrl(id: string, pollToken: string) {
  return `${window.location.origin}/rift/${encodeURIComponent(id)}#token=${encodeURIComponent(pollToken)}`;
}

export function parseRiftInput(value: string) {
  const trimmed = value.trim();
  if (validId(trimmed)) return { id: trimmed, token: null };

  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    const riftIndex = segments.lastIndexOf("rift");
    const id = riftIndex >= 0 ? segments[riftIndex + 1] : undefined;
    const token = new URLSearchParams(url.hash.slice(1)).get("token");
    if (!id || !validId(id)) return null;
    return { id, token: validToken(token) ? token : null };
  } catch {
    return null;
  }
}

export function validId(value: string | null | undefined): value is string {
  return typeof value === "string" && ID_RE.test(value);
}

export function validToken(value: string | null | undefined): value is string {
  return typeof value === "string" && TOKEN_RE.test(value);
}

function isSavedRift(value: unknown): value is SavedRift {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SavedRift>;
  return (
    validId(candidate.id) &&
    validToken(candidate.pollToken) &&
    typeof candidate.createdAt === "string"
  );
}

function writeRifts(items: SavedRift[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Recovery remains available in the current view when storage is blocked.
  }
}
