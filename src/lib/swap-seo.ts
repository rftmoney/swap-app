import type { Metadata } from "next";
import {
  pairHeadline,
  type PopularPair,
  POPULAR_SWAP_PAIRS,
} from "@/lib/popular-pairs";
import { siteOrigin } from "@/lib/site-url";

const SITE_NAME = "Rift";

export function buildSiteMetadata(): Metadata {
  const origin = siteOrigin();
  const title = "Rift — Cross-chain crypto swaps";
  const description =
    "Swap BTC, ETH, USDT, SOL and 200+ assets. No account. Non-custodial. Direct to your wallet in minutes.";

  return {
    title,
    description,
    metadataBase: new URL(origin),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: origin,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Rift" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export function buildSwapMetadata(pair: PopularPair): Metadata {
  const origin = siteOrigin();
  const route = pairHeadline(pair);
  const title = `Swap ${route} — No account | Rift`;
  const description = `Swap ${route} on Rift. Non-custodial, no KYC, direct to your wallet. Typical settlement in a few minutes.`;
  const url = `${origin}/swap/${pair.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `Rift ${route}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export function siteFaqJsonLd() {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do I need an account to swap on Rift?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Rift is non-custodial and does not require sign-up or KYC. Paste your receive wallet, open a rift, and send to the deposit address shown.",
        },
      },
      {
        "@type": "Question",
        name: "How long does a Rift swap take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most swaps settle in a few minutes after your deposit is detected on-chain. Timing depends on the networks involved and confirmation requirements.",
        },
      },
      {
        "@type": "Question",
        name: "Is Rift custodial?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Funds move wallet to wallet. Rift never holds your balance and never asks for a seed phrase.",
        },
      },
      {
        "@type": "Question",
        name: "Which assets does Rift support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Rift supports 200+ crypto assets across major networks including Bitcoin, Ethereum, Solana, Tron, BSC, and more.",
        },
      },
    ],
    url: origin,
  };
}

export function swapFaqJsonLd(pair: PopularPair) {
  const route = pairHeadline(pair);
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I swap ${route} on Rift?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Select ${route}, paste your receive wallet, tap Open rift, confirm the address, then send ${pair.from.coin.toUpperCase()} to the deposit address. Funds arrive in ${pair.to.coin.toUpperCase()} at your wallet.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${route} available without KYC?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Rift swaps are non-custodial and do not require account registration.",
        },
      },
    ],
    url: `${origin}/swap/${pair.slug}`,
  };
}

export function sitemapEntries() {
  const origin = siteOrigin();
  const now = new Date();
  const staticRoutes = ["/", "/docs", "/terms", "/privacy", "/card", "/rift"];
  return [
    ...staticRoutes.map((path) => ({
      url: `${origin}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: path === "/" ? ("daily" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : 0.7,
    })),
    ...POPULAR_SWAP_PAIRS.map((pair) => ({
      url: `${origin}/swap/${pair.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
