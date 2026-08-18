"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import cardArt from "../../public/rftusr.png";

export function CardPageContent() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Could not join");
      setSuccess(true);
      setMessage(data.message || "You’re on the Rift Card waitlist.");
      setEmail("");
    } catch (error) {
      setSuccess(false);
      setMessage(error instanceof Error ? error.message : "Could not join");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="card-page">
      <div className="card-page-copy">
        <p className="docs-kicker">{t("cardEarly")}</p>
        <h1>{t("cardPageTitle")}</h1>
        <p>{t("cardPageBody")}</p>
        <ul>
          <li>{t("cardFeature1")}</li>
          <li>{t("cardFeature2")}</li>
          <li>{t("cardFeature3")}</li>
        </ul>
        <p className="card-disclaimer">{t("comingSoon")}</p>

        <form className="card-page-form" onSubmit={submit}>
          <label htmlFor="card-page-email">{t("joinWaitlist")}</label>
          <div>
            <input
              id="card-page-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? t("joining") : t("join")}
            </button>
          </div>
          {message ? (
            <p
              className={`card-invite-message ${success ? "is-success" : "is-error"}`}
              role={success ? "status" : "alert"}
            >
              {message}
            </p>
          ) : null}
        </form>
      </div>

      <Image
        className="card-page-art"
        src={cardArt}
        alt="Rift debit card preview"
        quality={95}
        placeholder="blur"
        priority
        sizes="(max-width: 900px) calc(100vw - 2rem), 520px"
      />
    </main>
  );
}
