"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  type TranslationKey,
  useLanguage,
} from "@/components/LanguageProvider";
import { SupportLink } from "@/components/SupportLink";
import { useTheme } from "@/components/ThemeProvider";
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

const STATUS_MESSAGE: Record<string, TranslationKey> = {
  waiting: "statusMsgWaiting",
  pending: "statusMsgPending",
  processing: "statusMsgProcessing",
  settling: "statusMsgSettling",
  settled: "statusMsgSettled",
  refund: "statusMsgRefund",
  refunded: "statusMsgRefunded",
  expired: "statusMsgExpired",
  multiple: "statusMsgMultiple",
};

const STATUS_STEP: Record<string, number> = {
  waiting: 0,
  pending: 1,
  processing: 2,
  settling: 3,
  settled: 4,
  refunded: 4,
  expired: 4,
  refund: 3,
  multiple: 2,
};

const STEPS: TranslationKey[] = [
  "statusStepWaiting",
  "statusStepPending",
  "statusStepProcessing",
  "statusStepSettling",
  "statusStepDone",
];

export function DepositPanel({ shift, onBack, onRefresh }: Props) {
  const { locale, t } = useLanguage();
  const { theme } = useTheme();
  const status = shift.status?.toLowerCase() ?? "waiting";
  const done = ["settled", "refunded", "expired"].includes(status);
  const awaitingDeposit = status === "waiting" && !shift.depositAmount;
  const activeStep = STATUS_STEP[status] ?? 0;
  const [refreshing, setRefreshing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [pollError, setPollError] = useState(false);
  const [depositFlash, setDepositFlash] = useState(false);
  const prevStatus = useRef(status);
  const prevDepositAmount = useRef(shift.depositAmount);

  const trackingPath = `/rift/${encodeURIComponent(shift.id)}`;
  const trackingHost =
    typeof window !== "undefined" ? window.location.host : "rft.money";
  const trackingDisplay = `${trackingHost}${trackingPath}`;
  const trackingCopy =
    shift.pollToken && typeof window !== "undefined"
      ? privateRiftUrl(shift.id, shift.pollToken)
      : `https://${trackingDisplay}`;

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
        if (!res.ok) {
          setPollError(true);
          return;
        }
        setPollError(false);
        onRefresh(data);
      } catch {
        setPollError(true);
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [done, onRefresh, shift.id, shift.pollToken]);

  useEffect(() => {
    const statusChanged = prevStatus.current !== status;
    const depositArrived =
      !prevDepositAmount.current && Boolean(shift.depositAmount);

    if ((statusChanged && status !== "waiting") || depositArrived) {
      setDepositFlash(true);
      const timer = window.setTimeout(() => setDepositFlash(false), 2400);
      prevStatus.current = status;
      prevDepositAmount.current = shift.depositAmount;
      return () => window.clearTimeout(timer);
    }

    prevStatus.current = status;
    prevDepositAmount.current = shift.depositAmount;
  }, [shift.depositAmount, status]);

  async function refreshShift() {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/shift/${shift.id}`, {
        headers: shift.pollToken
          ? { "x-rift-shift-token": shift.pollToken }
          : undefined,
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setPollError(false);
        onRefresh(data);
      } else {
        setPollError(true);
      }
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <section
      className={`deposit-panel${depositFlash ? " is-updated" : ""}`}
      aria-live="polite"
    >
      <header className="deposit-header">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← {t("newRift")}
        </button>
        <p className={`status-pill status-${status}`}>
          <span className="status-dot" />
          {STATUS_COPY[status] ? t(STATUS_COPY[status]) : status}
        </p>
      </header>

      <div className="rift-status-banner" role="status">
        <p className="rift-status-headline">
          {STATUS_COPY[status] ? t(STATUS_COPY[status]) : status}
          {!done && !pollError ? (
            <span className="rift-status-live">{t("checkingStatus")}</span>
          ) : null}
        </p>
        <p className="rift-status-detail">
          {STATUS_MESSAGE[status] ? t(STATUS_MESSAGE[status]) : t("statusMsgWaiting")}
        </p>
        {shift.depositAmount ? (
          <p className="rift-deposit-detected">
            {t("depositDetected")}:{" "}
            <strong>
              {shift.depositAmount} {shift.depositCoin.toUpperCase()}
            </strong>
          </p>
        ) : null}
        {pollError ? (
          <p className="form-error rift-poll-error">{t("pollError")}</p>
        ) : null}
      </div>

      <ol className="rift-progress" aria-label="Swap progress">
        {STEPS.map((label, index) => {
          const state =
            index < activeStep
              ? "complete"
              : index === activeStep
                ? done && index === STEPS.length - 1
                  ? "complete"
                  : "active"
                : "upcoming";
          return (
            <li key={label} className={`rift-progress-step is-${state}`}>
              <span className="rift-progress-marker" aria-hidden />
              <span>{t(label)}</span>
            </li>
          );
        })}
      </ol>

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
            fgColor={theme === "light" ? "#0a0a0a" : "#ffffff"}
            level="M"
          />
          <figcaption>{t("scanPay")}</figcaption>
        </figure>

        <div className="deposit-fields">
          <div className="deposit-field">
            <span className="field-label">{t("riftTracking")}</span>
            <CopyRow
              value={trackingDisplay}
              copy={t("copy")}
              copied={t("copied")}
              copyValue={trackingCopy}
            />
            <p className="rift-tracking-hint">{t("riftTrackingHint")}</p>
          </div>

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
              <dt>Rift ID</dt>
              <dd title={shift.id}>{truncate(shift.id, 22)}</dd>
            </div>
            <div>
              <dt>{t("settlingTo")}</dt>
              <dd title={shift.settleAddress}>
                {truncate(shift.settleAddress)}
              </dd>
            </div>
            <div>
              {awaitingDeposit ? (
                <>
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
                </>
              ) : done ? (
                <>
                  <dt>
                    {status === "settled" ? t("completedAt") : t("openedAt")}
                  </dt>
                  <dd>
                    {shift.createdAt
                      ? new Date(shift.createdAt).toLocaleString(locale, {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </dd>
                </>
              ) : (
                <>
                  <dt>{t("rateLocked")}</dt>
                  <dd>{t("rateLockedHint")}</dd>
                </>
              )}
            </div>
          </dl>
        </div>
      </div>

      <footer className="deposit-footer">
        <p className="muted">{t("depositHelp")}</p>
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
              onClick={refreshShift}
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

function truncate(value: string, max = 18) {
  if (value.length <= max) return value;
  return `${value.slice(0, 10)}…${value.slice(-6)}`;
}

function CopyRow({
  value,
  copy,
  copied: copiedLabel,
  copyValue,
}: {
  value: string;
  copy: string;
  copied: string;
  copyValue?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="copy-row">
      <code>{value}</code>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(copyValue ?? value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? copiedLabel : copy}
      </button>
    </div>
  );
}
