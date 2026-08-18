"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  coinIconUrl,
  pickPreferredNetwork,
  type SideShiftCoin,
} from "@/lib/sideshift-shared";

type Props = {
  label: string;
  coins: SideShiftCoin[];
  coin: string;
  network: string;
  onChange: (coin: string, network: string) => void;
};

export function CoinPicker({ label, coins, coin, network, onChange }: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const networkListId = useId();

  const selected = coins.find((c) => c.coin === coin);
  const networks = selected?.networks ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter(
      (c) =>
        c.coin.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );
  }, [coins, query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setNetworkOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className={`coin-picker${open ? " is-open" : ""}`} ref={rootRef}>
      <span className="field-label">{label}</span>
      <div className="coin-picker-row">
        <button
          type="button"
          className="coin-trigger"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => {
            setOpen((value) => !value);
            setNetworkOpen(false);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coinIconUrl(coin)}
            alt=""
            width={28}
            height={28}
            className="coin-icon"
          />
          <span className="coin-trigger-text">
            <strong>{coin.toUpperCase()}</strong>
            <small>{selected?.name ?? coin}</small>
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={`network-picker${networkOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="network-trigger"
            aria-label={`${label} network`}
            aria-expanded={networkOpen}
            aria-controls={networkListId}
            onClick={() => {
              setNetworkOpen((value) => !value);
              setOpen(false);
            }}
          >
            <NetworkIcon network={network} />
            <span>{formatNetworkName(network)}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path
                d="M3.5 5.25L7 8.75L10.5 5.25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {networkOpen && (
            <div
              className="network-dropdown"
              id={networkListId}
              role="listbox"
            >
              {networks.map((net) => (
                <button
                  key={net}
                  type="button"
                  role="option"
                  aria-selected={net === network}
                  onClick={() => {
                    onChange(coin, net);
                    setNetworkOpen(false);
                  }}
                >
                  <NetworkIcon network={net} />
                  <span>{formatNetworkName(net)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="coin-dropdown" id={listId} role="listbox">
          <input
            className="coin-search"
            placeholder={t("searchCoin")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <ul>
            {filtered.map((c) => (
              <li key={c.coin}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.coin === coin}
                  onClick={() => {
                    const nextNetwork =
                      c.coin === coin
                        ? network
                        : pickPreferredNetwork(c.networks);
                    onChange(c.coin, nextNetwork);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coinIconUrl(c.coin)}
                    alt=""
                    width={24}
                    height={24}
                    className="coin-icon"
                  />
                  <span>
                    <strong>{c.coin.toUpperCase()}</strong>
                    <small>{c.name}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const NETWORK_COINS: Record<string, string> = {
  algorand: "algo",
  aptos: "apt",
  arbitrum: "eth",
  avax: "avax",
  avalanche: "avax",
  base: "eth",
  berachain: "bera",
  bitcoin: "btc",
  bitcoincash: "bch",
  bittensor: "tao",
  bsc: "bnb",
  cardano: "ada",
  celestia: "tia",
  core: "core",
  cosmos: "atom",
  cronos: "cro",
  dash: "dash",
  doge: "doge",
  ethereum: "eth",
  fetch: "fet",
  hedera: "hbar",
  hyperevm: "hype",
  icp: "icp",
  liquid: "btc",
  litecoin: "ltc",
  mainnet: "eth",
  mantle: "mnt",
  monad: "mon",
  near: "near",
  optimism: "eth",
  plasma: "xpl",
  polkadot: "dot",
  polygon: "matic",
  ripple: "xrp",
  robinhood: "eth",
  ronin: "ron",
  rootstock: "btc",
  seievm: "sei",
  solana: "sol",
  sonic: "s",
  stacks: "stx",
  starknet: "strk",
  stellar: "xlm",
  sui: "sui",
  ton: "ton",
  tron: "trx",
  xec: "xec",
  zksyncera: "eth",
};

function NetworkIcon({ network }: { network: string }) {
  const iconCoin = NETWORK_COINS[network.toLowerCase()];

  if (!iconCoin) {
    return (
      <span className="network-icon network-icon-fallback" aria-hidden>
        {network.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    <span className="network-icon">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={coinIconUrl(iconCoin)} alt="" width={22} height={22} />
    </span>
  );
}

function formatNetworkName(network: string) {
  const names: Record<string, string> = {
    avax: "Avalanche",
    bsc: "BNB Smart Chain",
    liquid: "Liquid Network",
    mainnet: "Mainnet",
    robinhood: "Robinhood",
    ton: "TON",
    tron: "Tron",
    zksyncera: "zkSync Era",
  };

  return (
    names[network.toLowerCase()] ??
    network.charAt(0).toUpperCase() + network.slice(1)
  );
}
