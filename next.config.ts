import type { NextConfig } from "next";

const sharedSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const defaultSecurityHeaders = [
  ...sharedSecurityHeaders,
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const telegramSecurityHeaders = [
  ...sharedSecurityHeaders,
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors https://web.telegram.org https://*.telegram.org",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: {
    qualities: [75, 95],
    formats: ["image/webp"],
  },
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/telegram/:path*",
        headers: telegramSecurityHeaders,
      },
      {
        source: "/telegram",
        headers: telegramSecurityHeaders,
      },
      {
        source: "/:path*",
        headers: defaultSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
