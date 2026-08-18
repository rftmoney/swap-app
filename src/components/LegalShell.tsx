import Link from "next/link";
import { Translated } from "@/components/LanguageProvider";

export function LegalShell({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="docs-shell">
      <header className="docs-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">Rift</span>
        </Link>
        <nav className="legal-nav" aria-label="Site">
          <Link href="/docs"><Translated id="docs" /></Link>
          <Link href="/terms"><Translated id="terms" /></Link>
          <Link href="/privacy"><Translated id="privacy" /></Link>
          <Link href="/rift"><Translated id="myRifts" /></Link>
          <Link className="nav-button" href="/">
            Open swap →
          </Link>
        </nav>
      </header>

      <main className="legal-content">
        <p className="docs-kicker">{kicker}</p>
        <h1>{title}</h1>
        <div className="legal-body">{children}</div>
      </main>
    </div>
  );
}
