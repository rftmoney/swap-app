"use client";

import { usePathname } from "next/navigation";
import { MarketTicker } from "@/components/MarketTicker";
import { RiftChat } from "@/components/RiftChat";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTelegram = pathname.startsWith("/telegram");

  return (
    <>
      {!isTelegram ? <MarketTicker /> : null}
      {children}
      {!isTelegram ? <RiftChat /> : null}
    </>
  );
}
