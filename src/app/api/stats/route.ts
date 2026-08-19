import { NextResponse } from "next/server";
import { getRecentShifts, listCoins } from "@/lib/sideshift";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/security";

/** Typical settlement window when upstream does not expose averages publicly. */
const DEFAULT_SETTLEMENT_MINUTES = 4;

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`stats:${ip}`, 20, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  try {
    const [coins, recent] = await Promise.all([
      listCoins(),
      getRecentShifts(50),
    ]);

    const now = Date.now();
    const dayMs = 86_400_000;
    const recentShifts24h = recent.filter((shift) => {
      const created = new Date(shift.createdAt).getTime();
      return Number.isFinite(created) && now - created < dayMs;
    }).length;

    return NextResponse.json(
      {
        assetCount: coins.length,
        recentShifts24h,
        averageSettlementMinutes: DEFAULT_SETTLEMENT_MINUTES,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        assetCount: 200,
        recentShifts24h: null,
        averageSettlementMinutes: DEFAULT_SETTLEMENT_MINUTES,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
        },
      },
    );
  }
}
