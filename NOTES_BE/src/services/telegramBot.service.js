import { searchNotesByQuery, formatTelegramSearchResults } from "./noteSearch.service.js";

const TELEGRAM_API_BASE = "https://api.telegram.org";
const POLL_TIMEOUT_SECONDS = 30;
const RETRY_DELAY_MS = 5000;

let pollingActive = false;
let currentOffset = 0;

const getTelegramConfig = () => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const logChatId = process.env.TELEGRAM_LOG_CHAT_ID?.trim();
  const botEnabled = (process.env.TELEGRAM_BOT_ENABLED || "true").toLowerCase() === "true";

  return {
    botToken,
    logChatId,
    enabled: Boolean(botToken) && botEnabled,
  };
};

const telegramRequest = async (method, payload = {}) => {
  const { botToken } = getTelegramConfig();

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data?.description || `Telegram API request failed: ${method}`);
  }

  return data.result;
};

const sendTelegramMessage = async (chatId, text, options = {}) => {
  return telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...options,
  });
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

const extractSearchQuery = (text) => {
  const match = text.match(/^\/search(?:@\w+)?(?:\s+([\s\S]+))?$/i);
  return match?.[1]?.trim() || "";
};

const formatJoinMessage = (message) => {
  const members = message.new_chat_members || [];
  const chatTitle = message.chat?.title || message.chat?.username || "a chat";
  const names = members
    .map((member) => {
      const fullName = [member.first_name, member.last_name].filter(Boolean).join(" ").trim();
      return fullName || member.username || String(member.id);
    })
    .join(", ");

  return `New member joined ${chatTitle}: ${names}`;
};

const handleMessage = async (message) => {
  if (message.new_chat_members?.length) {
    await notifyLogChannel(formatJoinMessage(message));
  }

  const text = message.text?.trim();
  if (!text) {
    return;
  }

  const chatId = message.chat?.id;
  if (!chatId) {
    return;
  }

  if (/^\/(start|help)(?:@\w+)?$/i.test(text)) {
    await sendTelegramMessage(
      chatId,
      [
        "Notes bot is ready.",
        "",
        "Use /search <subject, semester, branch, short form, keyword> to find notes.",
        "You can use it in private chats or group chats.",
      ].join("\n")
    );
    return;
  }

  if (/^\/search(?:@\w+)?/i.test(text)) {
    const query = extractSearchQuery(text);

    if (!query) {
      await sendTelegramMessage(chatId, "Use /search followed by a subject, semester, branch, or keyword.");
      return;
    }

    const notes = await searchNotesByQuery(query);
    const responseText = formatTelegramSearchResults(query, notes);

    await sendTelegramMessage(chatId, responseText);
  }
};

const pollTelegramUpdates = async () => {
  const { botToken } = getTelegramConfig();

  if (!botToken || !pollingActive) {
    return;
  }

  const url = new URL(`${TELEGRAM_API_BASE}/bot${botToken}/getUpdates`);
  url.searchParams.set("timeout", String(POLL_TIMEOUT_SECONDS));
  url.searchParams.set("allowed_updates", JSON.stringify(["message"]));
  if (currentOffset > 0) {
    url.searchParams.set("offset", String(currentOffset));
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data?.description || "Telegram polling failed");
    }

    for (const update of data.result || []) {
      currentOffset = update.update_id + 1;

      if (update.message) {
        await handleMessage(update.message);
      }
    }

    setImmediate(() => {
      void pollTelegramUpdates();
    });
  } catch (error) {
    console.error("Telegram polling error:", error.message);

    if (!pollingActive) {
      return;
    }

    setTimeout(() => {
      void pollTelegramUpdates();
    }, RETRY_DELAY_MS);
  }
};

const startTelegramBot = async () => {
  const { enabled } = getTelegramConfig();

  if (!enabled) {
    console.log("Telegram bot is disabled. Set TELEGRAM_BOT_TOKEN to enable it.");
    return;
  }

  if (pollingActive) {
    return;
  }

  pollingActive = true;
  console.log("Telegram bot polling started.");
  void pollTelegramUpdates();
};

const stopTelegramBot = () => {
  pollingActive = false;
};

const getTelegramBotStatus = () => ({
  enabled: getTelegramConfig().enabled,
  pollingActive,
  hasLogChannel: Boolean(getTelegramConfig().logChatId),
});

export {
  getTelegramBotStatus,
  sendTelegramMessage,
  startTelegramBot,
  stopTelegramBot,
};