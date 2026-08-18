import type { Metadata } from "next";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy — Rift",
  description: "Privacy policy for Rift cross-chain swaps.",
};

export default function PrivacyPage() {
  return (
    <LegalShell kicker="Legal" title="Privacy policy">
      <p className="legal-updated">Last updated: August 16, 2026</p>

      <section>
        <h2>1. Summary</h2>
        <p>
          Rift swaps work without accounts. We do not ask for your name, phone
          number, password, seed phrase, or private key. Email is optional and
          collected only if you join the separate Rift Card waitlist.
        </p>
      </section>

      <section>
        <h2>2. What we process to run a swap</h2>
        <p>To create and monitor a swap, technical data may be processed:</p>
        <ul>
          <li>selected assets and networks,</li>
          <li>destination wallet address (and memo/tag if required),</li>
          <li>swap identifiers and status updates,</li>
          <li>
            IP address and basic request metadata required by exchange
            infrastructure and abuse protection.
          </li>
        </ul>
        <p>
          Rift does not store a user profile or permanent customer account for
          swaps.
        </p>
      </section>

      <section>
        <h2>3. What we do not collect</h2>
        <ul>
          <li>account registration data,</li>
          <li>seed phrases or private keys,</li>
          <li>KYC documents through the Rift interface,</li>
          <li>marketing email lists from the swap flow.</li>
        </ul>
      </section>

      <section>
        <h2>4. Rift Card waitlist</h2>
        <p>
          If you voluntarily join the Rift Card waitlist, we store your email
          address and signup time to contact you about card access. Waitlist
          emails are not linked to swap addresses or transaction history and
          are retained only while the waitlist is operational.
        </p>
      </section>

      <section>
        <h2>5. Blockchain public data</h2>
        <p>
          Blockchain transactions are public. Amounts, addresses, and
          transaction hashes may be visible on explorers. “No account” does not
          mean absolute anonymity on-chain.
        </p>
      </section>

      <section>
        <h2>6. Cookies and analytics</h2>
        <p>
          Rift does not require login cookies. Essential technical storage may
          be used by the browser for dismissed interface notices and private
          Rift recovery tokens. Recovery data remains on your device unless you
          clear browser storage. If analytics are added later, this policy will
          be updated.
        </p>
      </section>

      <section>
        <h2>7. Third-party infrastructure</h2>
        <p>
          Swaps are executed through third-party exchange infrastructure. That
          provider may process technical data needed to settle deposits,
          refunds, and compliance checks under its own terms and policies.
          Hosting and database providers may process the limited technical or
          waitlist data described above.
        </p>
      </section>

      <section>
        <h2>8. Security</h2>
        <p>
          We apply standard web protections such as transport security headers,
          same-origin checks on sensitive actions, input validation, and rate
          limits. No online service is perfectly secure.
        </p>
      </section>

      <section>
        <h2>9. Changes</h2>
        <p>
          We may update this Privacy policy as the product changes. The “Last
          updated” date at the top will change when we do.
        </p>
      </section>
    </LegalShell>
  );
}
