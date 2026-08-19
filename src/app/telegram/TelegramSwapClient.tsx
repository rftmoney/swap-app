"use client";

import Image from "next/image";
import { useEffect } from "react";
import { SwapWidget } from "@/components/SwapWidget";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        themeParams?: { bg_color?: string };
      };
    };
  }
}

export function TelegramSwapClient() {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;
    webApp.ready();
    webApp.expand();
    webApp.setHeaderColor("#000000");
    webApp.setBackgroundColor("#000000");
  }, []);

  return (
    <main className="telegram-app" aria-label="Rift swap">
      <header className="telegram-app-header">
        <div className="telegram-app-brand">
          <Image
            src="/bot-avatar.png"
            alt=""
            width={56}
            height={56}
            priority
            className="telegram-app-logo"
          />
          <div>
            <p className="telegram-app-kicker">Rift</p>
            <h1>Swap desk</h1>
          </div>
        </div>
        <p>Non-custodial · Direct to wallet</p>
      </header>
      <SwapWidget />
    </main>
  );
}
