import "server-only";

import {
  registerTelegramWebhook,
  telegramBotAvatarUrl,
  telegramCall,
  telegramMiniAppUrl,
} from "@/lib/telegram-bot";
import {
  telegramBotDescription,
  telegramBotShortDescription,
} from "@/lib/telegram-about";
import { siteOrigin } from "@/lib/site-url";

const BOT_COMMANDS = [
  { command: "start", description: "Open the Rift home menu" },
  { command: "swap", description: "Open the swap desk" },
  { command: "about", description: "About Rift" },
  { command: "help", description: "How Rift works" },
  { command: "status", description: "Track a Rift swap" },
];

export async function configureTelegramBot() {
  const origin = siteOrigin();
  const miniAppUrl = telegramMiniAppUrl();

  await registerTelegramWebhook(origin);

  await telegramCall("setMyCommands", { commands: BOT_COMMANDS });

  await telegramCall("setDescription", {
    description: telegramBotDescription(),
  });

  await telegramCall("setShortDescription", {
    short_description: telegramBotShortDescription(),
  });

  await telegramCall("setMyName", {
    name: "Rift",
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
    botAvatarUrl: telegramBotAvatarUrl(),
    botFatherAvatarHint:
      "Upload public/bot-avatar.png via @BotFather → /mybots → Rift → Edit Bot → Edit Botpic",
    commands: BOT_COMMANDS.map((item) => item.command),
  };
}
