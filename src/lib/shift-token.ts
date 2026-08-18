import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_CONTEXT = "rift-shift-status-v1";

export function createShiftToken(shiftId: string) {
  return digest(shiftId);
}

export function verifyShiftToken(shiftId: string, token: string | null) {
  if (!token || token.length > 128) return false;

  const expected = Buffer.from(digest(shiftId));
  const supplied = Buffer.from(token);
  return (
    expected.length === supplied.length && timingSafeEqual(expected, supplied)
  );
}

function digest(shiftId: string) {
  const secret =
    process.env.RIFT_SHIFT_TOKEN_SECRET ?? process.env.SIDESHIFT_SECRET;
  if (!secret) throw new Error("Server configuration error");

  return createHmac("sha256", secret)
    .update(`${TOKEN_CONTEXT}:${shiftId}`)
    .digest("base64url");
}
