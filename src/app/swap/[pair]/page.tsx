import { notFound } from "next/navigation";
import { HomeClient } from "@/components/HomeClient";
import {
  getPopularPairBySlug,
  POPULAR_SWAP_PAIRS,
} from "@/lib/popular-pairs";
import { buildSwapMetadata, swapFaqJsonLd } from "@/lib/swap-seo";

type PageProps = {
  params: Promise<{ pair: string }>;
};

export function generateStaticParams() {
  return POPULAR_SWAP_PAIRS.map((pair) => ({ pair: pair.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { pair: slug } = await params;
  const pair = getPopularPairBySlug(slug);
  if (!pair) return {};
  return buildSwapMetadata(pair);
}

export default async function SwapPairPage({ params }: PageProps) {
  const { pair: slug } = await params;
  const pair = getPopularPairBySlug(slug);
  if (!pair) notFound();

  const jsonLd = swapFaqJsonLd(pair);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient initialPair={pair} />
    </>
  );
}
