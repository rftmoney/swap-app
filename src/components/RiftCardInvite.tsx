"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import cardArt from "../../public/rftusr.png";

const DISMISSED_KEY = "rift-card-invite-dismissed";

export function RiftCardInvite() {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"pending" | "open" | "closed">("pending");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = Boolean(window.sessionStorage.getItem(DISMISSED_KEY));
    } catch {
      // Storage may be unavailable in hardened/private browser contexts.
    }
    const timer = window.setTimeout(
      () => setPhase(dismissed ? "closed" : "open"),
      dismissed ? 0 : 900,
    );
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  function close() {
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Closing the dialog must still work when storage is blocked.
    }
    setPhase("closed");
  }

  function open() {
    try {
      window.sessionStorage.removeItem(DISMISSED_KEY);
    } catch {
      // Reopening must work when storage is blocked.
    }
    setPhase("open");
  }

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not join the waitlist");
      }

      setStatus("success");
      setMessage(data.message || "You’re on the Rift Card waitlist.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not join the waitlist",
      );
    }
  }

  if (phase === "pending") return null;

  if (phase === "closed") {
    return (
      <button
        type="button"
        className="card-invite-launcher"
        aria-haspopup="dialog"
        aria-expanded="false"
        onClick={open}
      >
        <Image src={cardArt} alt="" width={64} height={40} quality={95} />
        <span>
          <small>{t("cardEarly")}</small>
          <strong>Rift Card</strong>
        </span>
        <b aria-hidden>←</b>
      </button>
    );
  }

  return (
    <aside
      className="card-invite"
      role="dialog"
      aria-modal="false"
      aria-labelledby="card-invite-title"
    >
      <button
        type="button"
        className="card-invite-close"
        aria-label="Close Rift Card invitation"
        onClick={close}
      >
        ×
      </button>

      <Image
        className="card-invite-art"
        src={cardArt}
        alt="Preview of the Rift debit card"
        quality={95}
        placeholder="blur"
        sizes="(max-width: 560px) calc(100vw - 2rem), 340px"
      />

      <div className="card-invite-copy">
        <p className="card-invite-kicker">{t("cardEarly")}</p>
        <h2 id="card-invite-title">{t("cardTitle")}</h2>
        <p>{t("cardBody")}</p>
        <Link className="card-invite-link" href="/card">
          {t("learnMore")} →
        </Link>

        {status === "success" ? (
          <p className="card-invite-message is-success" role="status">
            {message}
          </p>
        ) : (
          <form className="card-invite-form" onSubmit={joinWaitlist}>
            <label htmlFor="rift-card-email">{t("joinWaitlist")}</label>
            <div>
              <input
                id="rift-card-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? t("joining") : t("join")}
              </button>
            </div>
            {status === "error" ? (
              <p className="card-invite-message is-error" role="alert">
                {message}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </aside>
  );
}
