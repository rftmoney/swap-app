"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CoinPicker } from "@/components/CoinPicker";
import { DepositPanel } from "@/components/DepositPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { SettleAddressField } from "@/components/SettleAddressField";
import { saveRift } from "@/lib/rift-history";
import type { PopularPair } from "@/lib/popular-pairs";
import {
  formatPairAsset,
  pickPreferredNetwork,
  type PairInfo,
  type Shift,
  type SideShiftCoin,
} from "@/lib/sideshift-shared";

const POPULAR = ["btc", "eth", "usdt", "usdc", "sol", "xrp", "ltc", "bnb"];

function resolveNetwork(
  coins: SideShiftCoin[],
  coin: string,
  network: string,
) {
  const asset = coins.find((item) => item.coin === coin);
  if (!asset) return network;
  if (asset.networks.includes(network)) return network;
  return pickPreferredNetwork(asset.networks);
}

function applyPopularPair(
  coins: SideShiftCoin[],
  pair: PopularPair,
) {
  return {
    fromCoin: pair.from.coin,
    fromNetwork: resolveNetwork(coins, pair.from.coin, pair.from.network),
    toCoin: pair.to.coin,
    toNetwork: resolveNetwork(coins, pair.to.coin, pair.to.network),
  };
}

type SwapWidgetProps = {
  onRiftChange?: (open: boolean) => void;
  initialPair?: PopularPair;
  pairPreset?: PopularPair | null;
  onPairPresetApplied?: () => void;
  onPairChange?: (pair: PopularPair) => void;
};

export function SwapWidget({
  onRiftChange,
  initialPair,
  pairPreset,
  onPairPresetApplied,
  onPairChange,
}: SwapWidgetProps) {
  const { t } = useLanguage();
  const [coins, setCoins] = useState<SideShiftCoin[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);
  const [fromCoin, setFromCoin] = useState("btc");
  const [fromNetwork, setFromNetwork] = useState("bitcoin");
  const [toCoin, setToCoin] = useState("eth");
  const [toNetwork, setToNetwork] = useState("ethereum");
  const [amount, setAmount] = useState("");
  const [settleAddress, setSettleAddress] = useState("");
  const [settleMemo, setSettleMemo] = useState("");
  const [confirmingAddress, setConfirmingAddress] = useState(false);
  const [confirmationSuffix, setConfirmationSuffix] = useState("");
  const [pair, setPair] = useState<PairInfo | null>(null);
  const [pairError, setPairError] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [flipped, setFlipped] = useState(false);

  function setRift(next: Shift | null) {
    if (next) {
      const withToken = {
        ...next,
        pollToken: next.pollToken || shift?.pollToken,
      };
      saveRift(withToken);
      setShift(withToken);
      onRiftChange?.(true);
      return;
    }
    setShift(null);
    onRiftChange?.(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/coins");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load coins");
        if (cancelled) return;
        const list = (data as SideShiftCoin[]).slice().sort((a, b) => {
          const ai = POPULAR.indexOf(a.coin);
          const bi = POPULAR.indexOf(b.coin);
          if (ai === -1 && bi === -1) return a.coin.localeCompare(b.coin);
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        });
        setCoins(list);
        const seed = initialPair
          ? applyPopularPair(list, initialPair)
          : {
              ...applyPopularPair(list, {
                slug: "btc-to-eth",
                label: "BTC → ETH",
                from: { coin: "btc", network: "bitcoin" },
                to: { coin: "eth", network: "ethereum" },
              }),
            };
        setFromCoin(seed.fromCoin);
        setFromNetwork(seed.fromNetwork);
        setToCoin(seed.toCoin);
        setToNetwork(seed.toNetwork);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load coins");
        }
      } finally {
        if (!cancelled) setLoadingCoins(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialPair]);

  useEffect(() => {
    if (!pairPreset || !coins.length) return;
    const next = applyPopularPair(coins, pairPreset);
    setPair(null);
    setFromCoin(next.fromCoin);
    setFromNetwork(next.fromNetwork);
    setToCoin(next.toCoin);
    setToNetwork(next.toNetwork);
    setAmount("");
    setSettleMemo("");
    setConfirmingAddress(false);
    setConfirmationSuffix("");
    onPairChange?.(pairPreset);
    onPairPresetApplied?.();
  }, [pairPreset, coins, onPairChange, onPairPresetApplied]);

  const fromAsset = useMemo(
    () => formatPairAsset(fromCoin, fromNetwork),
    [fromCoin, fromNetwork],
  );
  const toAsset = useMemo(
    () => formatPairAsset(toCoin, toNetwork),
    [toCoin, toNetwork],
  );

  const estimatedReceive = useMemo(() => {
    if (!pair?.rate || !amount || Number(amount) <= 0) return "";
    const value = Number(amount) * Number(pair.rate);
    if (!Number.isFinite(value)) return "";
    return value.toFixed(8).replace(/\.?0+$/, "");
  }, [amount, pair]);

  const requiresMemo = useMemo(() => {
    const asset = coins.find((item) => item.coin === toCoin);
    return Boolean(
      asset?.networksWithMemo?.some(
        (network) => network.toLowerCase() === toNetwork.toLowerCase(),
      ),
    );
  }, [coins, toCoin, toNetwork]);

  useEffect(() => {
    if (!fromCoin || !toCoin || fromAsset === toAsset) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setQuoting(true);
      setPairError(null);
      try {
        const params = new URLSearchParams({ from: fromAsset, to: toAsset });
        if (amount && Number(amount) > 0) params.set("amount", amount);
        const res = await fetch(`/api/pair?${params}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Pair unavailable");
        setPair(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setPair(null);
        setPairError(err instanceof Error ? err.message : "Pair error");
      } finally {
        setQuoting(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [amount, fromAsset, fromCoin, toAsset, toCoin]);

  const swapSides = useCallback(() => {
    setPair(null);
    setFlipped((v) => !v);
    setFromCoin(toCoin);
    setFromNetwork(toNetwork);
    setToCoin(fromCoin);
    setToNetwork(fromNetwork);
    setAmount("");
    setSettleMemo("");
    setConfirmingAddress(false);
    setConfirmationSuffix("");
  }, [fromCoin, fromNetwork, toCoin, toNetwork]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (amount && Number(amount) > 0) {
      if (pair?.min && Number(amount) < Number(pair.min)) {
        setError(`Minimum deposit is ${pair.min} ${fromCoin.toUpperCase()}`);
        return;
      }
      if (pair?.max && Number(amount) > Number(pair.max)) {
        setError(`Maximum deposit is ${pair.max} ${fromCoin.toUpperCase()}`);
        return;
      }
    }
    if (!settleAddress.trim()) {
      setError(t("enterAddress"));
      return;
    }
    if (
      settleAddress.trim().length < 8 ||
      settleAddress.trim().length > 128 ||
      /[<>"'`\\]/.test(settleAddress)
    ) {
      setError(t("invalidAddress"));
      return;
    }
    if (requiresMemo && !settleMemo.trim()) {
      setError(t("enterMemo"));
      return;
    }
    if (!confirmingAddress) {
      setConfirmingAddress(true);
      setConfirmationSuffix("");
      return;
    }
    if (confirmationSuffix !== settleAddress.trim().slice(-6)) {
      setError(t("confirmationMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositCoin: fromCoin,
          depositNetwork: fromNetwork,
          settleCoin: toCoin,
          settleNetwork: toNetwork,
          settleAddress: settleAddress.trim(),
          settleMemo: settleMemo.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open the rift");
      const created = data.shift as Shift;
      saveRift(created);
      setRift(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (shift) {
    return (
      <DepositPanel
        shift={shift}
        onBack={() => {
          setRift(null);
          setError(null);
        }}
        onRefresh={setRift}
      />
    );
  }

  return (
    <form className="swap-panel" onSubmit={onSubmit}>
      <div className="swap-panel-top">
        <h2>{t("swapTicket")}</h2>
        <p className="rate-chip" aria-live="polite">
          {quoting
            ? t("syncing")
            : pair
              ? `1 ${fromCoin.toUpperCase()} = ${Number(pair.rate).toPrecision(6)} ${toCoin.toUpperCase()}`
              : pairError
                ? t("noMarket")
                : t("selectPair")}
        </p>
      </div>

      <div className="asset-stack">
        <div className="asset-block">
          <CoinPicker
            label={t("send")}
            coins={coins}
            coin={fromCoin}
            network={fromNetwork}
            onChange={(coin, network) => {
              setPair(null);
              setFromCoin(coin);
              setFromNetwork(network);
              setConfirmingAddress(false);
            }}
          />
          <label className="amount-field">
            <span className="field-label">{t("sizeOptional")}</span>
            <input
              inputMode="decimal"
              placeholder={pair?.min ? `Min ${pair.min}` : "0.00"}
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9.]/g, ""))
              }
              disabled={loadingCoins}
            />
          </label>
        </div>

        <button
          type="button"
          className={`swap-flip ${flipped ? "is-flipped" : ""}`}
          onClick={swapSides}
          aria-label={t("swapAssets")}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
            <path
              d="M6 4v9M6 13l-2.5-2.5M6 13l2.5-2.5M14 16V7M14 7l-2.5 2.5M14 7l2.5 2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="asset-block">
          <CoinPicker
            label={t("receive")}
            coins={coins}
            coin={toCoin}
            network={toNetwork}
            onChange={(coin, network) => {
              setPair(null);
              setToCoin(coin);
              setToNetwork(network);
              setSettleMemo("");
              setConfirmingAddress(false);
            }}
          />
          <label className="amount-field">
            <span className="field-label">{t("estimated")}</span>
            <input
              readOnly
              value={estimatedReceive}
              placeholder="—"
              tabIndex={-1}
            />
          </label>
        </div>
      </div>

      {pair && (
        <p className="limits muted">
          {t("limits")} {pair.min} – {pair.max} {fromCoin.toUpperCase()}
        </p>
      )}

      <SettleAddressField
        coin={toCoin}
        network={toNetwork}
        value={settleAddress}
        onChange={(next) => {
          setSettleAddress(next);
          setConfirmingAddress(false);
          setConfirmationSuffix("");
        }}
      />

      {requiresMemo ? (
        <label className="address-field">
          <span className="field-label">{t("memoRequired")}</span>
          <input
            value={settleMemo}
            onChange={(event) => {
              setSettleMemo(event.target.value);
              setConfirmingAddress(false);
            }}
            placeholder={t("pasteMemo")}
            autoComplete="off"
            spellCheck={false}
            maxLength={128}
          />
        </label>
      ) : null}

      {confirmingAddress ? (
        <section className="address-confirmation" aria-labelledby="verify-address">
          <p className="field-label" id="verify-address">
            {t("verifyTitle")}
          </p>
          <p>{t("verifyBody")}</p>
          <code>{settleAddress.trim()}</code>
          {requiresMemo ? (
            <small>
              {t("memoRequired")}: {settleMemo}
            </small>
          ) : null}
          <label>
            <span>{t("typeLastSix")}</span>
            <input
              value={confirmationSuffix}
              onChange={(event) =>
                setConfirmationSuffix(event.target.value.slice(0, 6))
              }
              maxLength={6}
              autoComplete="off"
              spellCheck={false}
              placeholder={settleAddress.trim().slice(-6)}
              autoFocus
            />
          </label>
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              setConfirmingAddress(false);
              setConfirmationSuffix("");
            }}
          >
            {t("cancel")}
          </button>
        </section>
      ) : null}

      {error && <p className="form-error">{error}</p>}

      <button
        type="submit"
        className="primary-btn"
        disabled={submitting || loadingCoins || !pair}
      >
        {submitting
          ? t("openingRift")
          : confirmingAddress
            ? t("confirmOpen")
            : t("openRift")}
      </button>

      <p className="powered muted">
        {t("rateArrival")}
      </p>
    </form>
  );
}
