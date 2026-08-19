"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DeskClock } from "@/components/DeskClock";
import { useLanguage } from "@/components/LanguageProvider";
import { RecentTransactions } from "@/components/RecentTransactions";
import { RiftCardInvite } from "@/components/RiftCardInvite";
import { SwapWidget } from "@/components/SwapWidget";
import riftArt from "../../public/rift.png";

export default function Home() {
  const { t } = useLanguage();
  const [riftOpen, setRiftOpen] = useState(false);
  const [swapKey, setSwapKey] = useState(0);

  function goHome(event: React.MouseEvent<HTMLAnchorElement>) {
    // Already on "/": Next won't remount, so clear the open swap in place.
    if (!riftOpen) return;
    event.preventDefault();
    setRiftOpen(false);
    setSwapKey((value) => value + 1);
  }

  return (
    <div className={`shell${riftOpen ? " is-rift-open" : ""}`}>
      <header className="topbar">
        <Link className="brand" href="/" onClick={goHome}>
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">Rift</span>
        </Link>
        <nav className="top-nav" aria-label="Main navigation">
          <DeskClock />
          <Link href="/rift">{t("myRifts")}</Link>
          <Link href="/card">Card</Link>
          <Link className="nav-button" href="/docs">
            {t("docs")}
            <span aria-hidden>↗</span>
          </Link>
        </nav>
      </header>

      <main className={`hero${riftOpen ? " is-rift-open" : ""}`}>
        {!riftOpen && (
          <section className="hero-copy">
            <Image
              className="hero-art"
              src={riftArt}
              alt="Rift"
              priority
              sizes="(max-width: 900px) 80vw, 420px"
            />
            <h1>
              {t("heroLine1")}
              <br />
              <span>{t("heroLine2")}</span>
            </h1>
            <p>{t("heroBody")}</p>
            <ul className="hero-stats" aria-label="How Rift settles">
              <li>{t("nonCustodial")}</li>
              <li>{t("directWallet")}</li>
              <li>{t("noAccount")}</li>
            </ul>
          </section>
        )}

        <section className="hero-stage" aria-label="Swap">
          <SwapWidget key={swapKey} onRiftChange={setRiftOpen} />
        </section>
      </main>

      {!riftOpen && (
        <>
          <RiftCardInvite />
          <RecentTransactions />
          <footer className="site-footer">
            <nav className="footer-links" aria-label="Legal">
              <Link href="/docs">{t("docs")}</Link>
              <Link href="/terms">{t("terms")}</Link>
              <Link href="/privacy">{t("privacy")}</Link>
              <Link href="/rift">{t("myRifts")}</Link>
            </nav>
            <p>Always verify the deposit address before sending funds.</p>
          </footer>
        </>
      )}
    </div>
  );
}
