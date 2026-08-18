import { NextResponse } from "next/server";
import { getPair } from "@/lib/sideshift";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
  sanitizeAmount,
  sanitizePairAsset,
} from "@/lib/security";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`pair:${ip}`, 90, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  try {
    const { searchParams } = new URL(request.url);
    const from = sanitizePairAsset(searchParams.get("from"));
    const to = sanitizePairAsset(searchParams.get("to"));
    const rawAmount = searchParams.get("amount");
    const amount = sanitizeAmount(rawAmount ?? undefined);

    if (!from || !to) {
      return NextResponse.json(
        { error: "Missing from or to pair" },
        { status: 400 },
      );
    }
    if (rawAmount !== null && rawAmount !== "" && !amount) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 },
      );
    }

    if (from === to) {
      return NextResponse.json(
        { error: "Pair assets must differ" },
        { status: 400 },
      );
    }

    const pair = await getPair(from, to, amount);
    return NextResponse.json(pair, {
      headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json(
      { error: "Rate is temporarily unavailable" },
      { status: 502 },
    );
  }
}
