"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  type TranslationKey,
  useLanguage,
} from "@/components/LanguageProvider";
import { SupportLink } from "@/components/SupportLink";
import { privateRiftUrl } from "@/lib/rift-history";
import type { Shift } from "@/lib/sideshift-shared";
import { coinIconUrl } from "@/lib/sideshift-shared";

type Props = {
  shift: Shift;
  onBack: () => void;
  onRefresh: (shift: Shift) => void;
};

const STATUS_COPY: Record<string, TranslationKey> = {
  waiting: "waiting",
  pending: "pending",
  processing: "processing",
  settling: "settling",
  settled: "settled",
  refund: "refund",
  refunded: "refunded",
  expired: "expired",
  multiple: "multiple",
};

export function DepositPanel({ shift, onBack, onRefresh }: Props) {
  const { locale, t } = useLanguage();
  const status = shift.status?.toLowerCase() ?? "waiting";
  const done = ["settled", "refunded", "expired"].includes(status);
  const [refreshing, setRefreshing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (done) return;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/shift/${shift.id}`, {
          headers: shift.pollToken
            ? { "x-rift-shift-token": shift.pollToken }
            : undefined,
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok) onRefresh(data);
      } catch {
        /* ignore transient poll errors */
      }
    }, 8000);
    return () => window.clearInterval(timer);
  }, [done, onRefresh, shift.id, shift.pollToken]);

  return (
    <section className="deposit-panel" aria-live="polite">
      <header className="deposit-header">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← {t("newRift")}
        </button>
        <p className={`status-pill status-${status}`}>
          <span className="status-dot" />
          {STATUS_COPY[status] ? t(STATUS_COPY[status]) : status}
        </p>
      </header>

      <div className="route">
        <div className="route-side">
          <span className="field-label">{t("send")}</span>
          <div className="route-asset">
            <AssetIcon coin={shift.depositCoin} />
            <span className="route-asset-text">
              <strong>
                {shift.depositAmount
                  ? `${shift.depositAmount} ${shift.depositCoin.toUpperCase()}`
                  : shift.depositCoin.toUpperCase()}
              </strong>
              <small>{shift.depositNetwork}</small>
            </span>
          </div>
        </div>

        <span className="route-arrow" aria-hidden>
          →
        </span>

        <div className="route-side">
          <span className="field-label">{t("receive")}</span>
          <div className="route-asset">
            <AssetIcon coin={shift.settleCoin} />
            <span className="route-asset-text">
              <strong>
                {shift.settleAmount
                  ? `${shift.settleAmount} ${shift.settleCoin.toUpperCase()}`
                  : shift.settleCoin.toUpperCase()}
              </strong>
              <small>{shift.settleNetwork}</small>
            </span>
          </div>
        </div>
      </div>

      <div className="deposit-body">
        <figure className="qr-wrap">
          <QRCodeSVG
            value={shift.depositAddress}
            size={148}
            bgColor="transparent"
            fgColor="#ffffff"
            level="M"
          />
          <figcaption>{t("scanPay")}</figcaption>
        </figure>

        <div className="deposit-fields">
          <div className="deposit-field">
            <span className="field-label">{t("depositAddress")}</span>
            <CopyRow value={shift.depositAddress} copy={t("copy")} copied={t("copied")} />
          </div>

          {shift.depositMemo ? (
            <div className="deposit-field">
              <span className="field-label">{t("memoRequired")}</span>
              <CopyRow value={shift.depositMemo} copy={t("copy")} copied={t("copied")} />
            </div>
          ) : null}

          <dl className="deposit-meta">
            <div>
              <dt>{shift.depositAmount ? t("amount") : t("sendBetween")}</dt>
              <dd>
                {shift.depositAmount
                  ? `${shift.depositAmount} ${shift.depositCoin.toUpperCase()}`
                  : shift.depositMin && shift.depositMax
                    ? `${shift.depositMin} – ${shift.depositMax} ${shift.depositCoin.toUpperCase()}`
                    : "—"}
              </dd>
            </div>
            <div>
              <dt>{t("network")}</dt>
              <dd>{shift.depositNetwork}</dd>
            </div>
            <div>
              <dt>{t("settlingTo")}</dt>
              <dd title={shift.settleAddress}>
                {truncate(shift.settleAddress)}
              </dd>
            </div>
            <div>
              <dt>{t("validUntil")}</dt>
              <dd>
                {shift.expiresAt
                  ? new Date(shift.expiresAt).toLocaleString(locale, {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <footer className="deposit-footer">
        <p className="muted">
          {t("depositHelp")}
        </p>
        <div className="deposit-actions">
          <SupportLink label={t("support")} />
          {shift.pollToken ? (
            <button
              type="button"
              className="secondary-btn"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  privateRiftUrl(shift.id, shift.pollToken as string),
                );
                setLinkCopied(true);
                window.setTimeout(() => setLinkCopied(false), 1800);
              }}
            >
              {linkCopied ? t("linkCopied") : t("sharePrivate")}
            </button>
          ) : null}
          {!done && (
            <button
              type="button"
              className="secondary-btn"
              disabled={refreshing}
              onClick={async () => {
                setRefreshing(true);
                try {
                  const res = await fetch(`/api/shift/${shift.id}`, {
                    headers: shift.pollToken
                      ? { "x-rift-shift-token": shift.pollToken }
                      : undefined,
                    cache: "no-store",
                  });
                  const data = await res.json();
                  if (res.ok) onRefresh(data);
                } finally {
                  setRefreshing(false);
                }
              }}
            >
              {refreshing ? t("checking") : t("refresh")}
            </button>
          )}
        </div>
      </footer>
    </section>
  );
}

function AssetIcon({ coin }: { coin: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={coinIconUrl(coin)}
      alt=""
      width={28}
      height={28}
      className="coin-icon"
    />
  );
}

function truncate(value: string) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

function CopyRow({
  value,
  copy,
  copied: copiedLabel,
}: {
  value: string;
  copy: string;
  copied: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="copy-row">
      <code>{value}</code>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? copiedLabel : copy}
      </button>
    </div>
  );
}
