import { NextResponse } from "next/server";
import { getShift } from "@/lib/sideshift";
import { verifyShiftToken } from "@/lib/shift-token";
import {
  clientIp,
  publicShift,
  rateLimit,
  rateLimitedResponse,
  sanitizeShiftId,
} from "@/lib/security";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const ip = clientIp(request);
  const limited = await rateLimit(`shift-get:${ip}`, 60, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  try {
    const { id: rawId } = await context.params;
    const id = sanitizeShiftId(rawId);
    if (!id) {
      return NextResponse.json({ error: "Invalid shift id" }, { status: 400 });
    }
    if (!verifyShiftToken(id, request.headers.get("x-rift-shift-token"))) {
      return NextResponse.json(
        { error: "Not authorized to view this swap" },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    }

    const shift = await getShift(id);
    return NextResponse.json(
      {
        ...publicShift(shift as unknown as Record<string, unknown>),
        pollToken: request.headers.get("x-rift-shift-token"),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load swap status" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
