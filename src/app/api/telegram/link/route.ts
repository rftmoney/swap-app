import { NextResponse } from "next/server";
import {
  createTelegramNotifyLink,
  telegramBotUsername,
  telegramNotifyConfigured,
} from "@/lib/telegram-notify";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
  sanitizeShiftId,
} from "@/lib/security";
import { verifyShiftToken } from "@/lib/shift-token";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`telegram-link:${ip}`, 20, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  if (!telegramNotifyConfigured() || !telegramBotUsername()) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const shiftId = sanitizeShiftId(searchParams.get("shiftId"));
  if (!shiftId) {
    return NextResponse.json({ error: "Invalid shift id" }, { status: 400 });
  }
  if (!verifyShiftToken(shiftId, request.headers.get("x-rift-shift-token"))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const url = await createTelegramNotifyLink(shiftId);
  if (!url) {
    return NextResponse.json({ configured: false }, { status: 503 });
  }

  return NextResponse.json({ configured: true, url });
}
