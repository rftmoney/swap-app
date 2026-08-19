import { siteOrigin } from "@/lib/site-url";

/**
 * Shown in the empty chat BEFORE the user taps START (setMyDescription, max 512).
 * The round logo above this text is the bot profile photo — set in @BotFather.
 */
export function telegramPreStartWelcome() {
  return [
    "RIFT",
    "Enter one side. Exit another.",
    "",
    "Cross-chain crypto swaps — non-custodial, no account, direct to your wallet.",
    "",
    "• 200+ assets across major networks",
    "• Open Swap from the menu after START",
    "• Optional alerts when your swap completes",
    "",
    "Press START below to continue.",
    siteOrigin(),
  ].join("\n");
}

/** Bot profile / About tab (same welcome for consistency). */
export function telegramBotDescription() {
  return telegramPreStartWelcome();
}

/** Shown under the bot name in search and link previews (max 120). */
export function telegramBotShortDescription() {
  return "Rift — cross-chain swaps. Non-custodial, no account. Press START, then Open Swap.";
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
