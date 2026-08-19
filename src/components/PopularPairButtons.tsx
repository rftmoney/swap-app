"use client";

import Link from "next/link";
import {
  POPULAR_SWAP_PAIRS,
  type PopularPair,
} from "@/lib/popular-pairs";

type Props = {
  activeSlug?: string;
  onSelect: (pair: PopularPair) => void;
};

export function PopularPairButtons({ activeSlug, onSelect }: Props) {
  return (
    <div className="popular-pairs" role="group" aria-label="Popular swap routes">
      {POPULAR_SWAP_PAIRS.map((pair) => {
        const isActive = activeSlug === pair.slug;
        return (
          <Link
            key={pair.slug}
            href={`/swap/${pair.slug}`}
            className={`popular-pair-btn${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              onSelect(pair);
            }}
          >
            {pair.label}
          </Link>
        );
      })}
    </div>
  );
}
