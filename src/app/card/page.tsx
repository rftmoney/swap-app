import type { Metadata } from "next";
import Link from "next/link";
import { CardPageContent } from "@/components/CardPageContent";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Translated } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "Rift Card — Early access",
  description: "Join the private Rift Card early-access waitlist.",
};

export default function CardPage() {
  return (
    <div className="docs-shell card-shell">
      <header className="docs-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">Rift</span>
        </Link>
        <nav className="legal-nav" aria-label="Site">
          <ThemeToggle />
          <Link href="/rift"><Translated id="myRifts" /></Link>
          <Link className="nav-button" href="/">
            Open swap →
          </Link>
        </nav>
      </header>
      <CardPageContent />
    </div>
  );
}
