"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  type TranslationKey,
  useLanguage,
} from "@/components/LanguageProvider";
import { privateRiftUrl } from "@/lib/rift-history";
import type { Shift } from "@/lib/sideshift-shared";
import { coinIconUrl } from "@/lib/sideshift-shared";

type Props = {
  shift: Shift;
  onBack: () => void;
  onRefresh: (shift: Shift) => void;
};

const PROGRESS_STEPS: TranslationKey[] = [
  "statusStepWaiting",
  "statusStepConfirming",
  "statusStepSettling",
  "statusStepDone",
];

function progressStepIndex(status: string): number {
  const normalized = status.toLowerCase();
  if (normalized === "settled") return 3;
  if (normalized === "settling") return 2;
  if (["pending", "processing", "refund", "multiple"].includes(normalized)) {
    return 1;
  }
  return 0;
}

function stepHeadline(step: number): TranslationKey {
  return PROGRESS_STEPS[Math.min(step, PROGRESS_STEPS.length - 1)];
}

function stepDetail(step: number): TranslationKey {
  if (step >= 3) return "statusMsgSettled";
  if (step === 2) return "statusMsgSettling";
  if (step === 1) return "statusMsgConfirming";
  return "statusMsgWaiting";
}

export function DepositPanel({ shift, onBack, onRefresh }: Props) {
  const { locale, t } = useLanguage();
  const status = shift.status?.toLowerCase() ?? "waiting";
  const activeStep = progressStepIndex(status);
  const isComplete = status === "settled";
  const isExpired = status === "expired";
  const isRefunded = status === "refunded";
  const isTerminal = isExpired || isRefunded;
  const stopPolling = isComplete || isTerminal;
  const awaitingDeposit = activeStep === 0 && !shift.depositAmount;
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
    if (stopPolling) return;
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
  }, [onRefresh, shift.id, shift.pollToken, stopPolling]);

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

  if (isComplete) {
    return (
      <section className="deposit-panel is-complete" aria-live="polite">
        <CompletedScreen shift={shift} variant="success" t={t} />
        <footer className="deposit-footer deposit-footer-compact">
          <div className="deposit-actions deposit-actions-pair">
            <button type="button" className="primary-btn" onClick={onBack}>
              {t("newRift")}
            </button>
            {shift.pollToken ? (
              <ShareLinkButton shift={shift} t={t} />
            ) : null}
          </div>
        </footer>
      </section>
    );
  }

  if (isTerminal) {
    return (
      <section className="deposit-panel is-terminal" aria-live="polite">
        <header className="deposit-header">
          <button type="button" className="ghost-btn" onClick={onBack}>
            ← {t("newRift")}
          </button>
        </header>
        <CompletedScreen
          shift={shift}
          variant={isExpired ? "expired" : "refunded"}
          t={t}
        />
        <footer className="deposit-footer deposit-footer-compact">
          <div className="deposit-actions">
            <button type="button" className="secondary-btn" onClick={onBack}>
              {t("newRift")}
            </button>
          </div>
        </footer>
      </section>
    );
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
        <p className={`status-pill status-step-${activeStep}`}>
          <span className="status-dot" />
          {t(stepHeadline(activeStep))}
        </p>
      </header>

      <div className="rift-status-banner" role="status">
        <p className="rift-status-headline">
          {t(stepHeadline(activeStep))}
          {!pollError ? (
            <span className="rift-status-live">{t("checkingStatus")}</span>
          ) : null}
        </p>
        <p className="rift-status-detail">{t(stepDetail(activeStep))}</p>
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

      <ol className="rift-progress rift-progress-four" aria-label="Swap progress">
        {PROGRESS_STEPS.map((label, index) => {
          const state =
            index < activeStep
              ? "complete"
              : index === activeStep
                ? "active"
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

      {activeStep === 0 ? (
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
              <CopyRow
                value={shift.depositAddress}
                copy={t("copy")}
                copied={t("copied")}
              />
            </div>

            {shift.depositMemo ? (
              <div className="deposit-field">
                <span className="field-label">{t("memoRequired")}</span>
                <CopyRow
                  value={shift.depositMemo}
                  copy={t("copy")}
                  copied={t("copied")}
                />
              </div>
            ) : null}

            <DepositMeta
              shift={shift}
              locale={locale}
              t={t}
              awaitingDeposit={awaitingDeposit}
            />
          </div>
        </div>
      ) : (
        <div className="deposit-body deposit-body-confirming">
          <div className="rift-confirming-pulse" aria-hidden />
          <p className="rift-confirming-note">{t("statusMsgConfirming")}</p>
          <DepositMeta
            shift={shift}
            locale={locale}
            t={t}
            awaitingDeposit={false}
          />
        </div>
      )}

      <footer className="deposit-footer">
        {activeStep === 0 ? (
          <p className="muted">{t("depositHelp")}</p>
        ) : null}
        <div className="deposit-actions">
          {shift.pollToken ? (
            <ShareLinkButton shift={shift} t={t} />
          ) : null}
          <button
            type="button"
            className="secondary-btn"
            disabled={refreshing}
            onClick={refreshShift}
          >
            {refreshing ? t("checking") : t("refresh")}
          </button>
        </div>
      </footer>
    </section>
  );
}

function CompletedScreen({
  shift,
  variant,
  t,
}: {
  shift: Shift;
  variant: "success" | "expired" | "refunded";
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const title =
    variant === "success"
      ? t("riftCompleted")
      : variant === "expired"
        ? t("riftExpiredTitle")
        : t("riftRefundedTitle");
  const body =
    variant === "success"
      ? t("riftCompletedBody")
      : variant === "expired"
        ? t("riftExpiredBody")
        : t("riftRefundedBody");

  return (
    <div className={`rift-complete-screen is-${variant}`}>
      <div className="rift-complete-icon" aria-hidden>
        {variant === "success" ? <CheckIcon /> : <CloseIcon />}
      </div>
      <h2 className="rift-complete-title">{title}</h2>
      <p className="rift-complete-body">{body}</p>
      <div className="rift-complete-route">
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
      <p className="rift-complete-wallet" title={shift.settleAddress}>
        {t("settlingTo")}: {truncate(shift.settleAddress, 28)}
      </p>
    </div>
  );
}

function DepositMeta({
  shift,
  locale,
  t,
  awaitingDeposit,
}: {
  shift: Shift;
  locale: string;
  t: ReturnType<typeof useLanguage>["t"];
  awaitingDeposit: boolean;
}) {
  return (
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
        <dd title={shift.settleAddress}>{truncate(shift.settleAddress)}</dd>
      </div>
      {awaitingDeposit ? (
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
      ) : null}
    </dl>
  );
}

function ShareLinkButton({
  shift,
  t,
}: {
  shift: Shift;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const [linkCopied, setLinkCopied] = useState(false);

  return (
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
  );
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M5 12.5 10 17.5 19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M7 7l10 10M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
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
