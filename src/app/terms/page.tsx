import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms — Rift",
  description: "Terms of use for Rift cross-chain swaps.",
};

export default function TermsPage() {
  return (
    <LegalShell kicker="Legal" title="Terms of use">
      <p className="legal-updated">Last updated: August 16, 2026</p>

      <section>
        <h2>1. Service</h2>
        <p>
          Rift is a non-custodial front-end that helps you initiate crypto swaps
          between supported assets and networks. You send funds from your own
          wallet to a generated deposit address and receive converted assets at
          the destination address you provide. Rift does not create accounts,
          hold user balances, or request seed phrases or private keys.
        </p>
      </section>

      <section>
        <h2>2. Acceptance</h2>
        <p>
          By using Rift you agree to these Terms. If you do not agree, do not
          use the service.
        </p>
      </section>

      <section>
        <h2>3. Eligibility and compliance</h2>
        <p>
          You are responsible for complying with the laws that apply to you,
          including sanctions, tax, and crypto regulations. Access may be
          restricted in some jurisdictions by the underlying exchange
          infrastructure. You must not use Rift for unlawful activity.
        </p>
      </section>

      <section>
        <h2>4. Swaps, rates, and limits</h2>
        <ul>
          <li>
            Rates shown before deposit are estimates. For variable-rate swaps,
            the rate locks when the deposit is detected.
          </li>
          <li>
            You should send an amount within the displayed minimum and maximum.
            Amounts outside that range may be delayed, reviewed, or refunded.
          </li>
          <li>
            Network fees, confirmation times, and congestion are outside Rift’s
            control.
          </li>
          <li>
            Always verify the asset, network, deposit address, and destination
            address before sending funds.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. No custody of keys</h2>
        <p>
          Rift never asks for your seed phrase or private keys. During a swap,
          funds temporarily move through exchange infrastructure until
          settlement. This is not a trustless or atomic protocol.
        </p>
      </section>

      <section>
        <h2>6. Risks</h2>
        <p>You acknowledge crypto transfers involve risk, including:</p>
        <ul>
          <li>sending to the wrong address or network,</li>
          <li>market movement between estimate and settlement,</li>
          <li>blockchain delays, congestion, or failed transactions,</li>
          <li>loss of funds if you reuse expired deposit addresses.</li>
        </ul>
        <p>
          Rift is provided “as is” without warranties of uninterrupted service,
          error-free operation, or specific exchange outcomes.
        </p>
      </section>

      <section>
        <h2>7. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Rift and its operators are not
          liable for indirect, incidental, special, consequential, or punitive
          damages, or for lost profits, data, or crypto assets arising from use
          of the service, including user error, network failures, or third-party
          infrastructure issues.
        </p>
      </section>

      <section>
        <h2>8. Changes</h2>
        <p>
          These Terms may be updated from time to time. Continued use after
          changes means you accept the revised Terms.
        </p>
      </section>
    </LegalShell>
  );
}
