import { NextResponse } from "next/server";
import {
  createVariableShift,
  getClientIp,
  listCoins,
} from "@/lib/sideshift";
import { createShiftToken } from "@/lib/shift-token";
import {
  assertSameOrigin,
  clientIp,
  publicShift,
  rateLimit,
  rateLimitedResponse,
  readJsonBody,
  sanitizeAddress,
  sanitizeCoin,
  sanitizeMemo,
  sanitizeNetwork,
} from "@/lib/security";

type ShiftBody = {
  depositCoin?: unknown;
  depositNetwork?: unknown;
  settleCoin?: unknown;
  settleNetwork?: unknown;
  settleAddress?: unknown;
  settleMemo?: unknown;
  refundAddress?: unknown;
  refundMemo?: unknown;
};

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`shift:${ip}`, 8, 60_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
  }

  const parsed = await readJsonBody<ShiftBody>(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const depositCoin = sanitizeCoin(parsed.data.depositCoin);
  const depositNetwork = sanitizeNetwork(parsed.data.depositNetwork);
  const settleCoin = sanitizeCoin(parsed.data.settleCoin);
  const settleNetwork = sanitizeNetwork(parsed.data.settleNetwork);
  const settleAddress = sanitizeAddress(parsed.data.settleAddress);
  const settleMemo = sanitizeMemo(parsed.data.settleMemo);
  // Refund address accepted only if valid; never required.
  const refundAddress = sanitizeAddress(parsed.data.refundAddress) || undefined;
  const refundMemo = sanitizeMemo(parsed.data.refundMemo);

  if (
    !depositCoin ||
    !depositNetwork ||
    !settleCoin ||
    !settleNetwork ||
    !settleAddress
  ) {
    return NextResponse.json(
      { error: "Invalid or missing swap fields" },
      { status: 400 },
    );
  }
  if (
    parsed.data.settleMemo !== undefined &&
    parsed.data.settleMemo !== null &&
    parsed.data.settleMemo !== "" &&
    !settleMemo
  ) {
    return NextResponse.json(
      { error: "Invalid destination memo or tag" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (depositCoin === settleCoin && depositNetwork === settleNetwork) {
    return NextResponse.json(
      { error: "Deposit and settle assets must differ" },
      { status: 400 },
    );
  }

  try {
    const supported = await listCoins();
    const depositSupported = supported.some(
      (asset) =>
        asset.coin.toLowerCase() === depositCoin &&
        asset.networks.some(
          (network) => network.toLowerCase() === depositNetwork,
        ),
    );
    const settleAsset = supported.find(
      (asset) => asset.coin.toLowerCase() === settleCoin,
    );
    const settleSupported = settleAsset?.networks.some(
      (network) => network.toLowerCase() === settleNetwork,
    );
    if (!depositSupported || !settleSupported) {
      return NextResponse.json(
        { error: "Unsupported asset or network" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }
    const memoRequired = settleAsset?.networksWithMemo?.some(
      (network) => network.toLowerCase() === settleNetwork,
    );
    if (memoRequired && !settleMemo) {
      return NextResponse.json(
        { error: "This destination network requires a memo or tag" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const userIp = await getClientIp(request);
    const shift = await createVariableShift(
      {
        depositCoin,
        depositNetwork,
        settleCoin,
        settleNetwork,
        settleAddress,
        settleMemo,
        refundAddress,
        refundMemo,
      },
      userIp,
    );

    return NextResponse.json(
      {
        shift: {
          ...publicShift(shift as unknown as Record<string, unknown>),
          pollToken: createShiftToken(shift.id),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error: "Unable to create swap. Verify the address and try again.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
