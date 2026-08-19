import { siteOrigin } from "@/lib/site-url";

export const RIFT_TELEGRAM_TAGLINE =
  "Cross-chain swaps, wallet to wallet. No account. No custody.";

/**
 * Shown in the empty chat BEFORE the user taps START (setMyDescription, max 512).
 * The round logo above this text is the bot profile photo — set in @BotFather.
 */
export function telegramPreStartWelcome() {
  return [
    "RIFT",
    "Enter one side. Exit another.",
    "",
    RIFT_TELEGRAM_TAGLINE,
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
  return `${RIFT_TELEGRAM_TAGLINE} Press START, then Open Swap.`;
}
