import "server-only";

import {
  answerTelegramCallback,
  sendTelegramMessage,
  telegramBotProfileUrl,
  telegramMiniAppUrl,
  type TelegramInlineKeyboard,
} from "@/lib/telegram-bot";
import { linkTelegramChat } from "@/lib/telegram-notify";
import { siteOrigin } from "@/lib/site-url";

type TelegramMessage = {
  chat?: { id?: number };
  text?: string;
};

type TelegramCallbackQuery = {
  id?: string;
  data?: string;
  message?: TelegramMessage;
};

type TelegramUpdate = {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

function mainMenuKeyboard(): TelegramInlineKeyboard {
  const miniApp = telegramMiniAppUrl();
  const site = siteOrigin();
  return {
    inline_keyboard: [
      [{ text: "Open Swap", web_app: { url: miniApp } }],
      [
        { text: "Help", callback_data: "help" },
        { text: "Website", url: site },
      ],
    ],
  };
}

function alertEnabledKeyboard(): TelegramInlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "Open Swap", web_app: { url: telegramMiniAppUrl() } }],
      [{ text: "Track on web", url: `${siteOrigin()}/rift` }],
    ],
  };
}

function mainMenuText() {
  return [
    "<b>Rift on Telegram</b>",
    "",
    "Swap across chains — non-custodial, no account, direct to your wallet.",
    "",
    "• Tap <b>Open Swap</b> to start a new rift",
    "• Use /status to recover an active swap",
    "• Completion alerts can be enabled from the swap screen",
  ].join("\n");
}

function helpText() {
  return [
    "<b>How Rift works</b>",
    "",
    "1. Open Swap and pick your route",
    "2. Paste your receive wallet",
    "3. Send crypto to the deposit address shown",
    "4. Receive funds directly in your wallet",
    "",
    "Rift never holds your funds and never asks for a seed phrase.",
    "",
    `Support: ${telegramBotProfileUrl()}`,
  ].join("\n");
}

function statusHelpText() {
  return [
    "<b>Track a Rift</b>",
    "",
    "Open My Rifts on the website and paste your Rift ID or private link.",
    "",
    "From the website you can also enable Telegram alerts for an active swap.",
    "",
    `My Rifts: ${siteOrigin()}/rift`,
  ].join("\n");
}

async function sendMainMenu(chatId: number) {
  await sendTelegramMessage(chatId, mainMenuText(), {
    parseMode: "HTML",
    replyMarkup: mainMenuKeyboard(),
  });
}

async function sendHelp(chatId: number) {
  await sendTelegramMessage(chatId, helpText(), {
    parseMode: "HTML",
    replyMarkup: mainMenuKeyboard(),
  });
}

async function sendStatusHelp(chatId: number) {
  await sendTelegramMessage(chatId, statusHelpText(), {
    parseMode: "HTML",
    replyMarkup: mainMenuKeyboard(),
  });
}

async function handleNotifyStart(chatId: number, payload: string) {
  const token = payload.slice("notify_".length);
  const shiftId = await linkTelegramChat(token, chatId);
  if (!shiftId) {
    await sendTelegramMessage(
      chatId,
      [
        "<b>Alert link expired</b>",
        "",
        "Open your active swap on rft.money and tap Alert on Telegram again.",
      ].join("\n"),
      { parseMode: "HTML", replyMarkup: mainMenuKeyboard() },
    );
    return;
  }

  await sendTelegramMessage(
    chatId,
    [
      "<b>Alerts enabled</b>",
      "",
      "We'll message you here when this swap completes.",
      "",
      "You can close this chat — no need to keep the website open.",
    ].join("\n"),
    { parseMode: "HTML", replyMarkup: alertEnabledKeyboard() },
  );
}

async function handleCommand(chatId: number, text: string) {
  const [rawCommand, ...args] = text.trim().split(/\s+/);
  const command = rawCommand.split("@")[0]?.toLowerCase() ?? "";

  if (command === "/start") {
    const payload = args[0] ?? "";
    if (payload.startsWith("notify_")) {
      await handleNotifyStart(chatId, payload);
      return;
    }
    await sendMainMenu(chatId);
    return;
  }

  if (command === "/swap") {
    await sendTelegramMessage(chatId, "Opening the Rift swap desk…", {
      replyMarkup: {
        inline_keyboard: [
          [{ text: "Open Swap", web_app: { url: telegramMiniAppUrl() } }],
        ],
      },
    });
    return;
  }

  if (command === "/help") {
    await sendHelp(chatId);
    return;
  }

  if (command === "/status") {
    await sendStatusHelp(chatId);
    return;
  }

  await sendTelegramMessage(
    chatId,
    "Use /swap to open the desk or /help for guidance.",
    { replyMarkup: mainMenuKeyboard() },
  );
}

async function handleCallback(callback: TelegramCallbackQuery) {
  const chatId = callback.message?.chat?.id;
  if (!chatId || !callback.id) return;

  if (callback.data === "help") {
    await answerTelegramCallback(callback.id);
    await sendHelp(chatId);
    return;
  }

  if (callback.data === "menu") {
    await answerTelegramCallback(callback.id);
    await sendMainMenu(chatId);
    return;
  }

  await answerTelegramCallback(callback.id, "Unknown action.");
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim();
  if (!chatId || !text) return;

  if (text.startsWith("/")) {
    await handleCommand(chatId, text);
    return;
  }

  await sendTelegramMessage(
    chatId,
    "Tap Open Swap below, or type /help.",
    { replyMarkup: mainMenuKeyboard() },
  );
}
