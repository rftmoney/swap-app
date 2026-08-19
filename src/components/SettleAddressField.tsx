"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { looksLikeDomainName } from "@/lib/networks";

type Props = {
  coin: string;
  network: string;
  value: string;
  onChange: (value: string) => void;
  onResolved?: (meta: { name: string; service: string } | null) => void;
};

export function SettleAddressField({
  coin,
  network,
  value,
  onChange,
  onResolved,
}: Props) {
  const { t } = useLanguage();
  const [resolving, setResolving] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolveSeq = useRef(0);

  useEffect(() => {
    const trimmed = value.trim();
    if (!looksLikeDomainName(trimmed)) {
      setResolving(false);
      return;
    }

    const seq = ++resolveSeq.current;
    const timer = window.setTimeout(async () => {
      setResolving(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          name: trimmed.toLowerCase(),
          coin,
          network,
        });
        const response = await fetch(`/api/resolve?${params}`);
        const data = await response.json();
        if (seq !== resolveSeq.current) return;
        if (!response.ok) {
          throw new Error(data.error || t("nameResolveFailed"));
        }
        onChange(data.address);
        setHint(
          t("nameResolved", {
            name: data.name,
            service: String(data.service).toUpperCase(),
          }),
        );
        onResolved?.({ name: data.name, service: data.service });
      } catch (err) {
        if (seq !== resolveSeq.current) return;
        setHint(null);
        onResolved?.(null);
        setError(err instanceof Error ? err.message : t("nameResolveFailed"));
      } finally {
        if (seq === resolveSeq.current) setResolving(false);
      }
    }, 450);

    return () => window.clearTimeout(timer);
    // Intentionally omit unstable callback deps; coin/network/value drive resolution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, coin, network]);

  return (
    <div className="settle-address">
      <label className="address-field">
        <span className="field-label">
          {t("settlementAddress")} ({coin.toUpperCase()})
        </span>
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setHint(null);
            setError(null);
          }}
          placeholder={t("pasteAddressOrName", { coin: coin.toUpperCase() })}
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      {(resolving || hint || error) && (
        <div className="settle-assist">
          {resolving ? <p className="settle-hint">{t("resolvingName")}</p> : null}
          {!resolving && hint ? <p className="settle-hint">{hint}</p> : null}
          {error ? <p className="form-error settle-error">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
