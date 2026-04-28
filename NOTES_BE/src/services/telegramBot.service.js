import fs from "fs";
import path from "path";
import telegramPkg from "telegram";
import eventsPkg from "telegram/events/index.js";
import sessionsPkg from "telegram/sessions/index.js";
import { searchNotesByQuery, formatTelegramSearchResults } from "./noteSearch.service.js";

const { TelegramClient, Api, utils } = telegramPkg;
const { NewMessage } = eventsPkg;
const { StringSession } = sessionsPkg;

let telegramClient;
let telegramHandlerAttached = false;

const getTelegramConfig = () => {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH?.trim();
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const logChatId = process.env.TELEGRAM_LOG_CHAT_ID?.trim();
  const sessionString = process.env.TELEGRAM_SESSION?.trim() || "";
  const botEnabled = (process.env.TELEGRAM_BOT_ENABLED || "true").toLowerCase() === "true";

  return {
    apiId: Number.isFinite(apiId) ? apiId : undefined,
    apiHash,
    botToken,
    logChatId,
    sessionString,
    enabled: Boolean(botEnabled && botToken && apiId && apiHash),
  };
};

const isNumericEntity = (value) => typeof value === "string" && /^-?\d+$/.test(value);

const resolveTelegramEntity = (value) => {
  if (value == null) {
    return undefined;
  }

  if (typeof value === "bigint" || typeof value === "number") {
    return value;
  }

  if (isNumericEntity(value)) {
    return BigInt(value);
  }

  return value;
};

const formatName = (entity) => utils.getDisplayName(entity) || entity?.username || String(entity?.id || "unknown");

const formatJoinMessage = async (message) => {
  const chat = await message.getChat().catch(() => undefined);
  const chatName = formatName(chat) || "a chat";

  if (message.action instanceof Api.MessageActionChatAddUser) {
    const addedUsers = Array.isArray(message.actionEntities) ? message.actionEntities : [];
    const names = addedUsers.length ? addedUsers.map(formatName).join(", ") : "unknown user";
    return `New member joined ${chatName}: ${names}`;
  }

  const sender = await message.getSender().catch(() => undefined);
  const senderName = formatName(sender);
  return `New member joined ${chatName}: ${senderName}`;
};

const extractSearchQuery = (text) => {
  const match = text.match(/^\/search(?:@\w+)?(?:\s+([\s\S]+))?$/i);
  return match?.[1]?.trim() || "";
};

const buildGridButtons = (buttons = [], columns = 2) => {
  // buttons: [{ text, url?, data? }]
  const rows = [];
  for (let i = 0; i < buttons.length; i += columns) {
    const slice = buttons.slice(i, i + columns).map((b) => {
      const btn = { text: b.text };
      if (b.url) btn.url = b.url;
      if (b.data) btn.data = b.data;
      return btn;
    });
    rows.push(slice);
  }
  return rows;
};

const sendTelegramMessage = async (entity, text, options = {}) => {
  if (!telegramClient) {
    throw new Error("Telegram client is not started");
  }

  const payload = {
    message: text,
    linkPreview: false,
  };

  if (options.parseMode === "md" || options.parseMode === "markdown") {
    payload.parseMode = "md";
  }

  if (Array.isArray(options.buttons)) {
    payload.buttons = buildGridButtons(options.buttons, options.columns || 2);
  }

  if (options.media) {
    // Sending media with reply markup can cause REPLY_MARKUP_INVALID for some
    // entity types. To avoid that, send the media first (with caption), then
    // send a follow-up message that contains the buttons.
    await telegramClient.sendMessage(resolveTelegramEntity(entity), {
      file: options.media,
      caption: text,
      parseMode: payload.parseMode,
      linkPreview: false,
    });

    if (payload.buttons) {
      // send an additional lightweight message that only carries the buttons
      return telegramClient.sendMessage(resolveTelegramEntity(entity), {
        message: "\u200b",
        buttons: payload.buttons,
        linkPreview: false,
      });
    }

    return;
  }

  return telegramClient.sendMessage(resolveTelegramEntity(entity), payload);
};

const notifyLogChannel = async (text) => {
  const { logChatId } = getTelegramConfig();

  if (!logChatId) {
    return;
  }

  try {
    await sendTelegramMessage(logChatId, text);
  } catch (error) {
    console.error("Telegram log channel error:", error.message);
  }
};

const handleTelegramMessage = async (event) => {
  const message = event.message;
  const rawText = message.rawText?.trim() || "";

  if (
    message.action instanceof Api.MessageActionChatAddUser ||
    message.action instanceof Api.MessageActionChatJoinedByLink ||
    message.action instanceof Api.MessageActionChatJoinedByRequest
  ) {
    await notifyLogChannel(await formatJoinMessage(message));
  }

  if (!rawText) {
    return;
  }

  const chatId = message.chatId || event.chatId;
  if (!chatId) {
    return;
  }

  if (/^\/(start|help)(?:@\w+)?$/i.test(rawText)) {
    const body = [
      "*Welcome to Notes — your study companion!*",
      "",
      "Find and share study notes quickly. Use the buttons below to get started, or run /search <query>.",
      "",
      "_Tip:_ try `cse 4th sem data structures` or `/search calculus`",
      "",
      "Admin: send /adminhelp (visible to bot admins)",
    ].join("\n");

    const buttons = [
      { text: "🔎 Search", data: "SEARCH_ACTION" },
      { text: "📂 Browse", url: "https://your-app.example.com/browse" },
      { text: "⬆️ Upload", url: "https://your-app.example.com/upload" },
      { text: "👤 Profile", url: "https://your-app.example.com/profile" },
    ];

    // placeholder media; replace with a real URL/file id if you have one
    const media = process.env.NOTES_BOT_START_IMAGE || "https://placehold.co/800x300?text=Notes+Bot";

    await sendTelegramMessage(chatId, body, { parseMode: "md", buttons, columns: 2, media });
    return;
  }

  // Informational helper: return user's Telegram id so they can add themselves as admin
  if (/^\/whoami\b/i.test(rawText)) {
    const sender = await message.getSender().catch(() => undefined);
    const senderId = sender ? String(sender.id || sender?.userId || "(unknown)") : "(unknown)";
    await sendTelegramMessage(chatId, `Your Telegram id is: ${senderId}\n\nTo become an admin, add this id to TELEGRAM_ADMIN_IDS in NOTES_BE/.env (comma-separated).`);
    return;
  }

  // Admin-only commands
  if (
    /^\/setlog\b/i.test(rawText) ||
    /^\/setstartimage\b/i.test(rawText) ||
    /^\/(enablebot|disablebot|showconfig|adminhelp)\b/i.test(rawText)
  ) {
    const sender = await message.getSender().catch(() => undefined);
    if (!isAdmin(sender)) {
      await sendTelegramMessage(chatId, "You are not authorized to run admin commands.");
      return;
    }

    if (/^\/setlog\b/i.test(rawText)) {
      const parts = rawText.split(/\s+/);
      const arg = parts[1];
      if (!arg) {
        await sendTelegramMessage(chatId, "Usage: /setlog <@channelusername|t.me/link|numeric_id>");
        return;
      }

      const resolved = await resolveToBotChatId(telegramClient, arg);
      if (!resolved) {
        await sendTelegramMessage(chatId, `Could not resolve '${arg}'. Make sure the bot can access the channel or provide numeric id.`);
        return;
      }

      const ok = setEnvVar("TELEGRAM_LOG_CHAT_ID", resolved);
      if (ok) {
        await sendTelegramMessage(chatId, `Updated TELEGRAM_LOG_CHAT_ID = ${resolved}`);
      } else {
        await sendTelegramMessage(chatId, `Failed to update .env`);
      }

      return;
    }

    if (/^\/setstartimage\b/i.test(rawText)) {
      const parts = rawText.split(/\s+/);
      const arg = parts[1];
      if (!arg) {
        await sendTelegramMessage(chatId, "Usage: /setstartimage <image_url>");
        return;
      }
      const ok = setEnvVar("NOTES_BOT_START_IMAGE", arg);
      if (ok) await sendTelegramMessage(chatId, `Updated NOTES_BOT_START_IMAGE`);
      else await sendTelegramMessage(chatId, `Failed to update .env`);
      return;
    }

    if (/^\/enablebot\b/i.test(rawText)) {
      const ok = setEnvVar("TELEGRAM_BOT_ENABLED", "true");
      if (ok) {
        await sendTelegramMessage(chatId, "Bot enabled.");
        // try to start if not connected
        if (!telegramClient) await startTelegramBot();
      } else {
        await sendTelegramMessage(chatId, "Failed to update .env");
      }
      return;
    }

    if (/^\/disablebot\b/i.test(rawText)) {
      const ok = setEnvVar("TELEGRAM_BOT_ENABLED", "false");
      if (ok) {
        await sendTelegramMessage(chatId, "Bot disabled.");
        await stopTelegramBot();
      } else {
        await sendTelegramMessage(chatId, "Failed to update .env");
      }
      return;
    }

    if (/^\/showconfig\b/i.test(rawText)) {
      const cfg = getTelegramConfig();
      const out = [
        `Bot Enabled: ${cfg.enabled}`,
        `Log Chat ID: ${process.env.TELEGRAM_LOG_CHAT_ID || "(not set)"}`,
        `Start Image: ${process.env.NOTES_BOT_START_IMAGE || "(not set)"}`,
        `Admin IDs: ${maskAdminList()}`,
      ].join("\n");

      await sendTelegramMessage(chatId, out);
      return;
    }

    if (/^\/adminhelp\b/i.test(rawText)) {
      const help = [
        "Admin commands:",
        "",
        "/setlog <@username|t.me/link|id> — set log channel",
        "/setstartimage <url> — set start image shown in menu",
        "/enablebot — enable bot in .env and start it",
        "/disablebot — disable bot in .env and stop it",
        "/showconfig — show basic config (admin ids masked)",
      ].join("\n");

      await sendTelegramMessage(chatId, help);
      return;
    }
  }

  if (/^\/search(?:@\w+)?/i.test(rawText)) {
    const query = extractSearchQuery(rawText);

    if (!query) {
      await sendTelegramMessage(chatId, "Use /search followed by a subject, semester, branch, or keyword.");
      return;
    }

    const notes = await searchNotesByQuery(query);
    const responseText = formatTelegramSearchResults(query, notes);

    await sendTelegramMessage(chatId, responseText);
  }
};

const startTelegramBot = async () => {
  const { enabled, apiId, apiHash, botToken, sessionString } = getTelegramConfig();

  if (!enabled) {
    console.log("Telegram bot is disabled. Set TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_BOT_TOKEN to enable it.");
    return;
  }

  if (telegramClient) {
    return;
  }

  telegramClient = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 5,
  });

  if (!telegramHandlerAttached) {
    telegramClient.addEventHandler(handleTelegramMessage, new NewMessage({ incoming: true }));
    telegramHandlerAttached = true;
  }

  await telegramClient.start({ botAuthToken: botToken });
  console.log("Telegram bot connected with GramJS.");
};

const stopTelegramBot = async () => {
  if (!telegramClient) {
    return;
  }

  await telegramClient.disconnect().catch((error) => {
    console.error("Telegram bot disconnect error:", error.message);
  });

  telegramClient = undefined;
  telegramHandlerAttached = false;
};

const getTelegramBotStatus = () => ({
  enabled: getTelegramConfig().enabled,
  connected: Boolean(telegramClient),
  hasLogChannel: Boolean(getTelegramConfig().logChatId),
});

export {
  getTelegramBotStatus,
  sendTelegramMessage,
  startTelegramBot,
  stopTelegramBot,
};

const envFilePath = path.resolve(process.cwd(), "NOTES_BE/.env");

const setEnvVar = (key, value) => {
  try {
    let content = "";
    if (fs.existsSync(envFilePath)) {
      content = fs.readFileSync(envFilePath, "utf8");
    }

    const lines = content.split(/\r?\n/);
    const keyIndex = lines.findIndex((l) => l.trim().startsWith(key + "="));

    const entry = `${key}=${value}`;
    if (keyIndex >= 0) {
      lines[keyIndex] = entry;
    } else {
      if (content && !content.endsWith("\n")) lines.push("");
      lines.push(entry);
    }

    fs.writeFileSync(envFilePath, lines.join("\n"), "utf8");
    process.env[key] = value;
    return true;
  } catch (err) {
    console.error("Failed to write env file:", err?.message || err);
    return false;
  }
};

const getAdminIds = () => {
  const raw = process.env.TELEGRAM_ADMIN_IDS || "";
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
};

const isAdmin = (sender) => {
  if (!sender) return false;
  const admins = getAdminIds();
  const senderId = String(sender.id || sender?.userId || "");
  return admins.includes(senderId);
};

const maskAdminList = () => {
  const admins = getAdminIds();
  if (!admins.length) return "(not set)";
  return admins
    .map((id) => {
      if (id.length <= 4) return id.replace(/./g, "*");
      return id.slice(0, 2) + id.slice(2, -2).replace(/./g, "*") + id.slice(-2);
    })
    .join(", ");
};

const resolveToBotChatId = async (client, target) => {
  // Accept numeric ids, -100 prefixed ids, @username or t.me links
  if (!target) return null;
  const t = String(target).trim();
  if (/^-?\d+$/.test(t)) {
    // numeric id
    if (t.startsWith("-100")) return t;
    return `-100${t.replace(/^-/,'')}`;
  }

  try {
    const entity = await client.getEntity(t);
    if (!entity) return null;
    return `-100${String(entity.id)}`;
  } catch (err) {
    return null;
  }
};