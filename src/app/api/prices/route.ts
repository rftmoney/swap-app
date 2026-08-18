import { NextResponse } from "next/server";
import { fetchMarketSnapshot } from "@/lib/market-prices";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/security";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`prices:${ip}`, 40, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  try {
    const snapshot = await fetchMarketSnapshot();
    return NextResponse.json(
      {
        prices: snapshot.prices,
        updatedAt: snapshot.updatedAt,
        source: snapshot.source,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Market prices are temporarily unavailable" },
      { status: 502 },
    );
  }
}
