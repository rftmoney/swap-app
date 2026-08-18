"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getRecoveryToken,
  parseRiftInput,
  readRifts,
  saveRecoveryToken,
  type SavedRift,
} from "@/lib/rift-history";

export function RiftLookup() {
  const router = useRouter();
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState<SavedRift[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setSaved(readRifts()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function recover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = parseRiftInput(value);
    if (!parsed) {
      setError(t("invalidRift"));
      return;
    }

    const token = parsed.token || getRecoveryToken(parsed.id);
    if (!token) {
      setError(t("missingToken"));
      return;
    }
    saveRecoveryToken(parsed.id, token);
    router.push(`/rift/${encodeURIComponent(parsed.id)}`);
  }

  return (
    <main className="recovery-content">
      <p className="docs-kicker">Private recovery</p>
      <h1>{t("riftsTitle")}</h1>
      <p className="recovery-intro">{t("riftsBody")}</p>

      <form className="recovery-form" onSubmit={recover}>
        <label htmlFor="rift-lookup">{t("riftId")}</label>
        <div>
          <input
            id="rift-lookup"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="Rift ID or https://…/rift/…#token=…"
          />
          <button type="submit">{t("recover")}</button>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
      </form>

      <section className="saved-rifts" aria-labelledby="saved-rifts-title">
        <h2 id="saved-rifts-title">{t("recentRifts")}</h2>
        {saved.length ? (
          <div>
            {saved.map((rift) => (
              <Link href={`/rift/${encodeURIComponent(rift.id)}`} key={rift.id}>
                <span>
                  <strong>
                    {rift.depositCoin && rift.settleCoin
                      ? `${rift.depositCoin.toUpperCase()} → ${rift.settleCoin.toUpperCase()}`
                      : "Rift"}
                  </strong>
                  <small>{rift.id}</small>
                </span>
                <time dateTime={rift.createdAt}>
                  {new Date(rift.createdAt).toLocaleDateString()}
                </time>
              </Link>
            ))}
          </div>
        ) : (
          <p>{t("noSavedRifts")}</p>
        )}
      </section>
    </main>
  );
}
