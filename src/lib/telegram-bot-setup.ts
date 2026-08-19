import "server-only";

import {
  registerTelegramWebhook,
  telegramCall,
  telegramMiniAppUrl,
} from "@/lib/telegram-bot";
import { siteOrigin } from "@/lib/site-url";

const BOT_COMMANDS = [
  { command: "start", description: "Open the Rift home menu" },
  { command: "swap", description: "Open the swap desk" },
  { command: "help", description: "How Rift works" },
  { command: "status", description: "Track a Rift swap" },
];

export async function configureTelegramBot() {
  const origin = siteOrigin();
  const miniAppUrl = telegramMiniAppUrl();

  await registerTelegramWebhook(origin);

  await telegramCall("setMyCommands", { commands: BOT_COMMANDS });

  await telegramCall("setDescription", {
    description: [
      "Rift — cross-chain crypto swaps, direct to your wallet.",
      "",
      "• Non-custodial · No account · 200+ assets",
      "• Swap inside Telegram or on rft.money",
      "• Optional completion alerts for active swaps",
      "",
      "Tap Open Swap in the menu to begin.",
    ].join("\n"),
  });

  await telegramCall("setShortDescription", {
    short_description:
      "Cross-chain crypto swaps on Rift — non-custodial, direct to your wallet.",
  });

  await telegramCall("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "Open Swap",
      web_app: { url: miniAppUrl },
    },
  });

  return {
    ok: true,
    origin,
    miniAppUrl,
    commands: BOT_COMMANDS.map((item) => item.command),
  };
}
