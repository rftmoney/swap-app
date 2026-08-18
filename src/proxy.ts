import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BLOCKED_METHODS = new Set(["TRACE", "TRACK"]);

export function proxy(request: NextRequest) {
  if (BLOCKED_METHODS.has(request.method.toUpperCase())) {
    return new NextResponse(null, {
      status: 405,
      headers: { Allow: "GET, HEAD, POST, OPTIONS" },
    });
  }

  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = isApi ? apiContentSecurityPolicy() : pageContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);

  if (!isApi) {
    // Next.js reads the nonce from the incoming CSP and applies it to framework
    // scripts and styles while rendering the page.
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.delete("Server");
  response.headers.delete("X-Powered-By");

  if (isApi) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set(
      "Cache-Control",
      request.nextUrl.pathname.startsWith("/api/shift")
        ? "no-store, no-cache, must-revalidate, private"
        : response.headers.get("Cache-Control") || "no-store",
    );
  }

  return response;
}

function pageContentSecurityPolicy(nonce: string) {
  const isDev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https://sideshift.ai",
    "font-src 'self' data:",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-inline'" : ""}`,
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "media-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

function apiContentSecurityPolicy() {
  return [
    "default-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets Next serves efficiently.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
