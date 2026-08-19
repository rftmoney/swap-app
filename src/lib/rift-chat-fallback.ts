const FAQ: Array<{ match: RegExp; reply: string }> = [
  {
    match: /open rift|create swap|how (do i|to) swap|start swap|make swap/i,
    reply:
      "Choose send/receive coins, paste your destination wallet, tap Open rift, confirm the last 6 characters of the address, then send crypto to the deposit address shown. The rate locks when your deposit is detected.",
  },
  {
    match: /confirm|pending|processing|settling|waiting|deposit detected|status/i,
    reply:
      "After you send, the page updates automatically: Waiting for deposit → Confirming deposit → Processing → Sending to your wallet → Completed. Use Refresh if it looks stuck, or open your tracking link at rft.money/rift/…",
  },
  {
    match: /recover|private link|tracking|lost|rift id|my rift/i,
    reply:
      "Go to My Rifts (/rift) or open your private link (rft.money/rift/ID#token=…). The link works in any browser. Without the token, recovery only works on the same device where you opened the swap.",
  },
  {
    match: /wallet|metamask|phantom|connect/i,
    reply:
      "On the swap form you can connect MetaMask (EVM networks) or Phantom (Solana) only to fill the receive address. Rift never asks for your seed phrase and never signs transfers for you.",
  },
  {
    match: /\.eth|\.sol|\.crypto|\.nft|name|ens|sns|domain/i,
    reply:
      "Paste a name like name.eth, name.sol, or name.crypto in the settlement field. Rift resolves it server-side — always verify the resolved address before confirming the last 6 characters.",
  },
  {
    match: /rate|limit|min|max|amount|fee/i,
    reply:
      "Rift uses variable-rate swaps. The preview is an estimate; your final rate locks when the deposit arrives. Send any amount between the min and max shown on the swap ticket.",
  },
  {
    match: /card|waitlist|debit/i,
    reply:
      "Rift Card is early access. Join the waitlist on the Card page (/card) or from the home promo when it appears. Details may change before launch.",
  },
  {
    match: /safe|secure|custod|private|trust/i,
    reply:
      "Rift is non-custodial: funds move wallet to wallet. We never hold balances or ask for seeds. Always verify deposit and destination addresses. Public blockchains are analyzable — Rift is not a privacy guarantee.",
  },
  {
    match: /telegram|support|human|help me|stuck/i,
    reply:
      "For hands-on help, use Telegram support from the swap screen. Share your Rift ID and what step you’re on — never share seed phrases or private keys.",
  },
  {
    match: /what is rift|rft\.money|how does (it|rift) work/i,
    reply:
      "Rift (rft.money) is a cross-chain swap front-end. You send on one network and receive on another, directly to your wallet. No account required. Docs: /docs",
  },
];

const DEFAULT_REPLY =
  "I’m Lumen, Rift’s guide. I can help with swaps, deposit status, wallet fill, name resolution, recovery links, rates, and Rift Card. What are you trying to do?";

export function fallbackRiftReply(question: string): string {
  const trimmed = question.trim();
  if (!trimmed) return DEFAULT_REPLY;

  for (const entry of FAQ) {
    if (entry.match.test(trimmed)) return entry.reply;
  }

  return `${DEFAULT_REPLY} For step-by-step details, see /docs or Telegram support if you’re mid-swap.`;
}

export const LUMEN_GREETING =
  "Hey — I’m Lumen. Ask me about swaps, deposit status, wallets, recovery links, or anything on rft.money.";
