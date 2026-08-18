"use client";

import { evmChainId, isEvmNetwork, isSolanaNetwork } from "@/lib/networks";

type EthereumProvider = {
  request: (args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
  isMetaMask?: boolean;
};

type SolanaProvider = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{
    publicKey: { toString: () => string };
  }>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider & {
      providers?: EthereumProvider[];
    };
    solana?: SolanaProvider;
    phantom?: { solana?: SolanaProvider };
  }
}

export type WalletKind = "metamask" | "phantom";

function pickEthereumProvider() {
  const ethereum = window.ethereum;
  if (!ethereum) return null;
  if (Array.isArray(ethereum.providers) && ethereum.providers.length > 0) {
    return (
      ethereum.providers.find((provider) => provider.isMetaMask) ??
      ethereum.providers[0]
    );
  }
  return ethereum;
}

function pickSolanaProvider() {
  return window.phantom?.solana ?? window.solana ?? null;
}

export function availableWallets(network: string): WalletKind[] {
  const wallets: WalletKind[] = [];
  if (isEvmNetwork(network)) wallets.push("metamask");
  if (isSolanaNetwork(network)) wallets.push("phantom");
  return wallets;
}

export async function connectWalletAddress(
  kind: WalletKind,
  network: string,
): Promise<string> {
  if (kind === "metamask") {
    if (!isEvmNetwork(network)) {
      throw new Error("MetaMask works with EVM settle networks");
    }
    const provider = pickEthereumProvider();
    if (!provider) throw new Error("MetaMask is not installed");

    const chainId = evmChainId(network);
    if (chainId) {
      const hexChainId = `0x${chainId.toString(16)}`;
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId }],
        });
      } catch {
        // User may reject or the chain may be missing; address still works.
      }
    }

    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    const address = accounts[0];
    if (!address) throw new Error("No MetaMask account returned");
    return address;
  }

  if (!isSolanaNetwork(network)) {
    throw new Error("Phantom works with Solana settle networks");
  }
  const provider = pickSolanaProvider();
  if (!provider) throw new Error("Phantom is not installed");
  const connected = await provider.connect();
  const address =
    connected.publicKey?.toString() || provider.publicKey?.toString();
  if (!address) throw new Error("No Phantom account returned");
  return address;
}
