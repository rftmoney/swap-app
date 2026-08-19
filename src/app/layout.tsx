import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { connection } from "next/server";
import { MarketTicker } from "@/components/MarketTicker";
import { RiftChat } from "@/components/RiftChat";
import { buildSiteMetadata, siteFaqJsonLd } from "@/lib/swap-seo";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
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
        <MarketTicker />
        {children}
        <RiftChat />
      </body>
    </html>
  );
}
