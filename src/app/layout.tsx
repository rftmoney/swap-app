import type { Metadata } from "next";
import localFont from "next/font/local";
import { connection } from "next/server";
import { SiteChrome } from "@/components/SiteChrome";
import { buildSiteMetadata, siteFaqJsonLd } from "@/lib/swap-seo";
import "./globals.css";

const sora = localFont({
  src: [
    {
      path: "./fonts/sora-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/sora-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sora",
  display: "swap",
});

const manrope = localFont({
  src: [
    {
      path: "./fonts/manrope-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/manrope-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/manrope-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/manrope-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = buildSiteMetadata();

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // A request-bound render lets Proxy attach a unique CSP nonce to every page.
  await connection();

  const faqJsonLd = siteFaqJsonLd();

  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
