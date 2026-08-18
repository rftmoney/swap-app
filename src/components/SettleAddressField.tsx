"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { looksLikeDomainName } from "@/lib/networks";
import {
  availableWallets,
  connectWalletAddress,
  type WalletKind,
} from "@/lib/wallets";

type Props = {
  coin: string;
  network: string;
  value: string;
  onChange: (value: string) => void;
  onResolved?: (meta: { name: string; service: string } | null) => void;
};

const WALLET_LABEL: Record<WalletKind, string> = {
  metamask: "MetaMask",
  phantom: "Phantom",
};

export function SettleAddressField({
  coin,
  network,
  value,
  onChange,
  onResolved,
}: Props) {
  const { t } = useLanguage();
  const [wallets, setWallets] = useState<WalletKind[]>([]);
  const [walletBusy, setWalletBusy] = useState<WalletKind | null>(null);
  const [resolving, setResolving] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolveSeq = useRef(0);

  useEffect(() => {
    setWallets(availableWallets(network));
  }, [network]);

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

  async function onWallet(kind: WalletKind) {
    setWalletBusy(kind);
    setError(null);
    try {
      const address = await connectWalletAddress(kind, network);
      onChange(address);
      setHint(t("walletFilled", { wallet: WALLET_LABEL[kind] }));
      onResolved?.(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("walletFailed"));
    } finally {
      setWalletBusy(null);
    }
  }

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

      {(wallets.length > 0 || resolving || hint || error) && (
        <div className="settle-assist">
          {wallets.length > 0 ? (
            <div className="wallet-actions" aria-label={t("connectWallet")}>
              {wallets.map((wallet) => (
                <button
                  key={wallet}
                  type="button"
                  className="ghost-btn wallet-btn"
                  disabled={walletBusy !== null || resolving}
                  onClick={() => onWallet(wallet)}
                >
                  {walletBusy === wallet
                    ? t("connectingWallet")
                    : WALLET_LABEL[wallet]}
                </button>
              ))}
            </div>
          ) : null}
          {resolving ? <p className="settle-hint">{t("resolvingName")}</p> : null}
          {!resolving && hint ? <p className="settle-hint">{hint}</p> : null}
          {error ? <p className="form-error settle-error">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
