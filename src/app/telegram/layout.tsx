import type { Metadata } from "next";
import Script from "next/script";
import "./telegram.css";

export const metadata: Metadata = {
  title: "Rift Swap — Telegram",
  description: "Swap crypto cross-chain inside Telegram.",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/bot-avatar.png", type: "image/png" }],
    apple: [{ url: "/bot-avatar.png", type: "image/png" }],
  },
};

export default function TelegramLayout({ children }: LayoutProps<"/telegram">) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <div className="telegram-shell">{children}</div>
    </>
  );
}
