import { siteOrigin } from "@/lib/site-url";

/** Shown in the bot profile “About” tab (max 512 chars). */
export function telegramBotDescription() {
  return [
    "Rift opens a path between chains — send on one network, receive on another, direct to your wallet.",
    "",
    "• Non-custodial — we never hold your funds",
    "• No account or KYC required",
    "• 200+ assets across major networks",
    "• Swap here in Telegram or on the web",
    "• Optional alerts when your swap completes",
    "",
    "Tap Open Swap in the menu to begin.",
    "",
    siteOrigin(),
  ].join("\n");
}

/** Shown under the bot name in search / profile (max 120 chars). */
export function telegramBotShortDescription() {
  return "Cross-chain crypto swaps — non-custodial, no account, direct to your wallet. Tap Open Swap.";
}

/** Sent when the user runs /about or taps About. */
export function telegramAboutMessage() {
  const site = siteOrigin();
  return [
    "<b>About Rift</b>",
    "",
    "Rift is a non-custodial swap desk. You send crypto on one chain and receive on another — always to a wallet you control.",
    "",
    "<b>What we are</b>",
    "• Wallet-to-wallet swaps across 200+ assets",
    "• No sign-up, no seed phrases, no held balances",
    "• Built for clarity: verify your address before every swap",
    "",
    "<b>On Telegram</b>",
    "• <b>Open Swap</b> — full swap desk inside Telegram",
    "• <b>Alerts</b> — optional completion messages for active swaps",
    "• <b>/status</b> — recover a swap on the web",
    "",
    "<b>What we are not</b>",
    "• Not a custodian or exchange account",
    "• Not financial advice",
    "",
    `Website: ${site}`,
    "Docs: " + `${site}/docs`,
  ].join("\n");
}
