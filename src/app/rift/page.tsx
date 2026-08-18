import type { Metadata } from "next";
import Link from "next/link";
import { RiftLookup } from "@/components/RiftLookup";

export const metadata: Metadata = {
  title: "Recover a Rift",
  description: "Privately recover a saved Rift swap and check its status.",
  robots: { index: false, follow: false },
};

export default function RiftLookupPage() {
  return (
    <div className="docs-shell recovery-shell">
      <header className="docs-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">Rift</span>
        </Link>
        <nav className="legal-nav" aria-label="Site">
          <Link className="nav-button" href="/">
            Open swap →
          </Link>
        </nav>
      </header>
      <RiftLookup />
    </div>
  );
}
