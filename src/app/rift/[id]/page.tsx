import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Translated } from "@/components/LanguageProvider";
import { RiftStatusClient } from "@/components/RiftStatusClient";

export const metadata: Metadata = {
  title: "Rift status",
  description: "Private Rift swap status.",
  robots: { index: false, follow: false },
};

export default async function RiftStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="docs-shell recovery-shell">
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
      <div className="recovered-rift">
        <RiftStatusClient id={id} />
      </div>
    </div>
  );
}
