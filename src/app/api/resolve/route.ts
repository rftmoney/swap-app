import { NextResponse } from "next/server";
import { ResolveError, resolveDomainName } from "@/lib/name-resolve";
import {
  clientIp,
  rateLimit,
  rateLimitedResponse,
  sanitizeCoin,
  sanitizeNetwork,
} from "@/lib/security";

const NAME_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

export async function GET(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`resolve:${ip}`, 30, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  const { searchParams } = new URL(request.url);
  const rawName = searchParams.get("name")?.trim().toLowerCase() ?? "";
  const coin = sanitizeCoin(searchParams.get("coin") ?? undefined);
  const network = sanitizeNetwork(searchParams.get("network") ?? undefined);

  if (!rawName || rawName.length > 128 || !NAME_RE.test(rawName)) {
    return NextResponse.json(
      { error: "Enter a valid name like name.eth or name.sol" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const resolved = await resolveDomainName({
      name: rawName,
      coin: coin || undefined,
      network: network || undefined,
    });
    return NextResponse.json(resolved, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    const message =
      error instanceof ResolveError
        ? error.message
        : "Name could not be resolved";
    const status = error instanceof ResolveError ? 404 : 502;
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
