import type { Metadata } from "next";
import Link from "next/link";
import { Translated } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "Docs — Rift",
  description:
    "How Rift works, what privacy it provides, and what to know before swapping.",
};

const sections = [
  { id: "overview", label: "Overview" },
  { id: "privacy", label: "Privacy" },
  { id: "how-it-works", label: "How it works" },
  { id: "wallets-names", label: "Wallets & names" },
  { id: "rates", label: "Rates & limits" },
  { id: "security", label: "Security" },
  { id: "status", label: "Swap status" },
];

export default function DocsPage() {
  return (
    <div className="docs-shell">
      <header className="docs-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden />
          <span className="brand-name">Rift</span>
        </Link>
        <nav className="legal-nav" aria-label="Site">
          <Link href="/terms"><Translated id="terms" /></Link>
          <Link href="/privacy"><Translated id="privacy" /></Link>
          <Link href="/rift"><Translated id="myRifts" /></Link>
          <Link className="nav-button" href="/">
            Open swap →
          </Link>
        </nav>
      </header>

      <div className="docs-layout">
        <aside className="docs-sidebar">
          <p>Documentation</p>
          <nav aria-label="Documentation">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="docs-content">
          <section className="docs-intro" id="overview">
            <p className="docs-kicker">Rift documentation</p>
            <h1>Cross-chain swaps, without an account.</h1>
            <p>
              Rift is a simple route between blockchains. Choose what you send,
              where you want to receive it, and deposit from your own wallet.
              There are no Rift accounts, passwords, balances, or custodial
              wallets to maintain.
            </p>
            <div className="docs-facts">
              <div>
                <strong>200+</strong>
                <span>assets</span>
              </div>
              <div>
                <strong>7 days</strong>
                <span>deposit window</span>
              </div>
              <div>
                <strong>0</strong>
                <span>accounts required</span>
              </div>
            </div>
          </section>

          <DocSection number="01" title="Privacy" id="privacy">
            <h3>Private by default, not invisible.</h3>
            <p>
              Rift does not ask you to create an account, provide an email, or
              connect a persistent profile. A swap is identified by its unique
              order ID instead of a user account.
            </p>
            <Callout>
              “No account” does not mean absolute anonymity. Blockchain
              transfers are public, and network metadata such as an IP address
              may be processed by the infrastructure required to create and
              settle a swap.
            </Callout>
            <p>
              We avoid misleading privacy claims. Anyone analyzing public
              ledgers may be able to associate sending and receiving activity.
              Use Rift for accountless exchange—not as a guarantee of
              untraceability.
            </p>
          </DocSection>

          <DocSection number="02" title="How it works" id="how-it-works">
            <ol className="docs-steps">
              <li>
                <span>1</span>
                <div>
                  <h3>Choose a route</h3>
                  <p>
                    Select the asset and network you are sending from, then the
                    asset, network, and wallet where you want to receive.
                  </p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <h3>Open the rift</h3>
                  <p>
                    Rift generates a dedicated deposit address and displays the
                    valid minimum and maximum for that route.
                  </p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <h3>Send from your wallet</h3>
                  <p>
                    Deposit any amount inside the displayed range. The live rate
                    locks when the deposit is detected.
                  </p>
                </div>
              </li>
              <li>
                <span>4</span>
                <div>
                  <h3>Receive on the other side</h3>
                  <p>
                    After network confirmation, the converted asset is sent
                    directly to your destination wallet.
                  </p>
                </div>
              </li>
            </ol>
          </DocSection>

          <DocSection number="03" title="Wallets & names" id="wallets-names">
            <h3>Fill the destination without pasting by hand.</h3>
            <p>
              On the swap form you can connect a wallet only to read the receive
              address. Rift never asks for a seed phrase, never requests a
              transfer signature, and never holds your funds.
            </p>
            <ul>
              <li>
                <strong>MetaMask</strong> — EVM networks (Ethereum, Base,
                Arbitrum, Polygon, BSC, and similar).
              </li>
              <li>
                <strong>Phantom</strong> — Solana settle networks.
              </li>
            </ul>
            <h3>Pay to a name, not only a raw address.</h3>
            <p>
              Paste a human-readable name into the settlement field. Rift
              resolves it server-side and replaces it with the on-chain address
              before you confirm the last six characters.
            </p>
            <ul>
              <li>
                <strong>ENS</strong> — <code>name.eth</code> for EVM
                destinations.
              </li>
              <li>
                <strong>SNS</strong> — <code>name.sol</code> /{" "}
                <code>name.sns</code> for Solana destinations.
              </li>
              <li>
                <strong>Unstoppable Domains</strong> —{" "}
                <code>.crypto</code>, <code>.nft</code>, <code>.wallet</code>,
                and related TLDs when the operator has configured an API key.
              </li>
            </ul>
            <Callout>
              Always verify the resolved address. A name is only as trustworthy
              as the records its owner published. The confirmation step still
              applies after resolution or wallet fill.
            </Callout>
          </DocSection>

          <DocSection number="04" title="Rates & limits" id="rates">
            <h3>Flexible deposits, live settlement.</h3>
            <p>
              Rift uses variable-rate swaps. The preview on the home page is an
              estimate. Your final rate is determined when the deposit reaches
              the generated address and includes the effect of network costs.
            </p>
            <ul>
              <li>Send any amount between the minimum and maximum shown.</li>
              <li>
                Larger deposits can receive a different effective rate because
                fixed network costs have less impact.
              </li>
              <li>
                Deposits outside the permitted range may require review or be
                refunded.
              </li>
              <li>
                Each deposit is processed separately at the prevailing rate.
              </li>
            </ul>
          </DocSection>

          <DocSection number="05" title="Security" id="security">
            <h3>You stay in control of your wallets.</h3>
            <p>
              Rift never asks for a seed phrase or private key. You send from
              your wallet and receive at the address you provide. Funds pass
              through exchange infrastructure while the swap is processed, so
              this is not a trustless or atomic protocol.
            </p>
            <ul>
              <li>Verify the asset and network before sending.</li>
              <li>Confirm every character of the destination address.</li>
              <li>
                Never reuse a deposit address after its displayed validity
                period.
              </li>
            </ul>
            <h3>How the site is hardened</h3>
            <p>
              Nothing on the open internet is 100% safe. Rift is built to reduce
              common web attack surface as far as a swap front-end can:
            </p>
            <ul>
              <li>
                Strict Content-Security-Policy, clickjacking protection, and
                HTTPS hardening headers.
              </li>
              <li>
                Same-origin checks on swap creation so third-party sites cannot
                casually drive your browser into opening orders.
              </li>
              <li>
                Rate limits on every API route. In production these should run
                through a shared Redis store (Upstash) so limits hold across
                Vercel instances; local memory is only a development fallback.
              </li>
              <li>
                Input validation on coins, networks, addresses, and payload size.
              </li>
              <li>
                Liquidity credentials stay on the server — never in the browser.
              </li>
              <li>
                API responses are trimmed to the fields the UI needs; secrets
                and account keys are never returned.
              </li>
              <li>
                No Rift accounts, passwords, or stored balances — less personal
                data to steal from this site.
              </li>
            </ul>
            <Callout>
              Privacy is about minimizing identity on Rift. Blockchains remain
              public ledgers. If someone needs absolute anonymity, that depends
              on the asset, wallet hygiene, and network — not on any swap UI.
            </Callout>
          </DocSection>

          <DocSection number="06" title="Swap status" id="status">
            <p>
              Rift saves a recovery token in this browser after a swap is
              created. Paste the Rift ID on the recovery page to reopen it on
              the same device. To use another browser, copy the complete private
              link from the deposit panel.
            </p>
            <Callout>
              The token lives after <code>#token=</code> in the private link, so
              browsers do not send it to the server in normal requests. Anyone
              holding that complete link can view the swap status. Treat it like
              a private receipt.
            </Callout>
            <div className="status-list">
              <Status name="Waiting" text="The deposit has not been detected." />
              <Status
                name="Confirming"
                text="The deposit is visible and awaiting network confirmation."
              />
              <Status
                name="Processing"
                text="The confirmed deposit is being converted."
              />
              <Status
                name="Settling"
                text="The outgoing transaction has been created."
              />
              <Status
                name="Completed"
                text="The destination transaction is confirmed."
              />
              <Status
                name="Refund"
                text="The deposit could not settle and is moving through the refund flow."
              />
            </div>
          </DocSection>

          <footer className="docs-footer">
            <p>Understand the route. Verify the addresses. Cross the rift.</p>
            <Link href="/">Open swap →</Link>
          </footer>
        </main>
      </div>
    </div>
  );
}

function DocSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="docs-section" id={id}>
      <header>
        <span>{number}</span>
        <h2>{title}</h2>
      </header>
      <div className="docs-section-body">{children}</div>
    </section>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return <aside className="docs-callout">{children}</aside>;
}

function Status({ name, text }: { name: string; text: string }) {
  return (
    <div>
      <strong>{name}</strong>
      <p>{text}</p>
    </div>
  );
}
