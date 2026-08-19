import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  registerTelegramWebhook,
  telegramBotAvatarUrl,
  telegramCall,
  telegramMiniAppUrl,
} from "@/lib/telegram-bot";
import {
  telegramBotShortDescription,
  telegramPreStartWelcome,
} from "@/lib/telegram-about";
import { siteOrigin } from "@/lib/site-url";

const BOT_COMMANDS = [
  { command: "start", description: "Open the Rift home menu" },
  { command: "swap", description: "Open the swap desk" },
  { command: "about", description: "About Rift" },
  { command: "help", description: "How Rift works" },
  { command: "status", description: "Track a Rift swap" },
];

async function setBotDescription(description: string) {
  try {
    await telegramCall("setMyDescription", {
      description,
      language_code: "en",
    });
  } catch {
    await telegramCall("setDescription", { description });
  }
}

async function setBotShortDescription(shortDescription: string) {
  try {
    await telegramCall("setMyShortDescription", {
      short_description: shortDescription,
      language_code: "en",
    });
  } catch {
    await telegramCall("setShortDescription", {
      short_description: shortDescription,
    });
  }
}

/** Bot profile photos must usually be set in @BotFather; try API upload when available. */
async function tryUploadBotProfilePhoto() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) return { ok: false, reason: "missing_token" as const };

  const avatarPath = path.join(process.cwd(), "public", "bot-avatar.png");
  let bytes: Buffer;
  try {
    bytes = await readFile(avatarPath);
  } catch {
    return { ok: false, reason: "missing_avatar_file" as const };
  }

  const form = new FormData();
  form.append(
    "photo",
    new Blob([bytes], { type: "image/png" }),
    "bot-avatar.png",
  );

  for (const method of ["setMyProfilePhoto", "setUserProfilePhoto"] as const) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/${method}`,
        { method: "POST", body: form, signal: AbortSignal.timeout(20_000) },
      );
      const data = (await response.json()) as { ok?: boolean; description?: string };
      if (response.ok && data.ok) {
        return { ok: true, method };
      }
    } catch {
      /* try next method */
    }
  }

  return {
    ok: false,
    reason: "botfather_required" as const,
    avatarUrl: telegramBotAvatarUrl(),
  };
}

export async function configureTelegramBot() {
  const origin = siteOrigin();
  const miniAppUrl = telegramMiniAppUrl();
  const preStartWelcome = telegramPreStartWelcome();

  await registerTelegramWebhook(origin);

  await telegramCall("setMyCommands", { commands: BOT_COMMANDS });

  await setBotDescription(preStartWelcome);
  await setBotShortDescription(telegramBotShortDescription());

  await telegramCall("setMyName", {
    name: "Rift",
    language_code: "en",
  });

  await telegramCall("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: "Open Swap",
      web_app: { url: miniAppUrl },
    },
  });

  const profilePhoto = await tryUploadBotProfilePhoto();

  return {
    ok: true,
    origin,
    miniAppUrl,
    preStartWelcome,
    botAvatarUrl: telegramBotAvatarUrl(),
    profilePhoto,
    botFatherAvatarHint: profilePhoto.ok
      ? "Profile photo updated via API."
      : "Upload https://www.rft.money/bot-avatar.png in @BotFather → /mybots → Rift → Edit Bot → Edit Botpic",
    commands: BOT_COMMANDS.map((item) => item.command),
  };
}
