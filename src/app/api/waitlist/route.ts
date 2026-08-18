import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  clientIp,
  rateLimit,
  rateLimitedResponse,
  readJsonBody,
} from "@/lib/security";

type WaitlistBody = {
  email?: unknown;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = await rateLimit(`card-waitlist:${ip}`, 5, 60 * 60 * 1_000);
  if (!limited.ok) return rateLimitedResponse(limited.retryAfter);

  if (!assertSameOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden origin" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = await readJsonBody<WaitlistBody>(request, 1_024);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const email =
    typeof parsed.data.email === "string"
      ? parsed.data.email.trim().toLowerCase()
      : "";
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "The waitlist is not connected yet. Please try again soon." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const endpoint = new URL("/rest/v1/rift_card_waitlist", supabaseUrl);
    endpoint.searchParams.set("on_conflict", "email");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([{ email, source: "home_card_invite" }]),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) throw new Error("Waitlist storage rejected the request");

    return NextResponse.json(
      { message: "You’re on the Rift Card waitlist." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not join the waitlist. Please try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
