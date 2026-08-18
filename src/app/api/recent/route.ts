import { NextResponse } from "next/server";
import { getRecentShifts } from "@/lib/sideshift";
import { clientIp, rateLimit, rateLimitedResponse } from "@/lib/security";

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`recent:${ip}`, 30, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  try {
    const shifts = await getRecentShifts(10);
    const cleaned = shifts
      .map((shift) => ({
        createdAt: shift.createdAt,
        depositCoin: shift.depositCoin,
        depositNetwork: shift.depositNetwork,
        depositAmount: shift.depositAmount,
        settleCoin: shift.settleCoin,
        settleNetwork: shift.settleNetwork,
        settleAmount: shift.settleAmount,
      }))
      .filter((shift) => Boolean(shift.createdAt))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return NextResponse.json(cleaned, {
      headers: {
        "Cache-Control": "public, max-age=20, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Recent activity is temporarily unavailable" },
      { status: 502 },
    );
  }
}
