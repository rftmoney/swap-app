import { NextResponse } from "next/server";
import { listCoins } from "@/lib/sideshift";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/security";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`coins:${ip}`, 30, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  try {
    const coins = await listCoins();
    return NextResponse.json(coins, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Supported assets are temporarily unavailable" },
      { status: 502 },
    );
  }
}
