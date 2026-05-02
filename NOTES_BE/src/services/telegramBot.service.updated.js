import TelegramBot from "node-telegram-bot-api";
import { searchNotesByQuery, formatTelegramSearchResults } from "./noteSearch.service.js";
import {
  addTelegramAdminId,
  ensureTelegramBotConfig,
  getTelegramBotConfig,
  removeTelegramAdminId,
  setTelegramAdminIds,
  updateTelegramBotConfig,
} from "./botConfig.service.js";

let telegramBot;
let telegramBotUsername = "";

const START_MENU_DATA = {
  ABOUT: "start:about",
  DONATE: "start:donate",
  COMMANDS: "start:commands",
  SUPPORT: "start:support",
  UPDATES: "start:updates",
  ADD_GROUP: "start:add_group",
  VERIFY: "start:verify",
};

const DEFAULT_ADD_GROUP_PERMS = [
  "change_info",
  "post_messages",
  "edit_messages",
  "delete_messages",
  "invite_users",
  "restrict_members",
  "pin_messages",
  "promote_members",
  "manage_video_chats",
  "manage_topics",
];

const buildAddToGroupUrl = (botUsername, perms = DEFAULT_ADD_GROUP_PERMS) => {
  const base = botUsername ? `https://t.me/${botUsername}` : "https://t.me";
  const adminParam = perms && perms.length ? `admin=${perms.join("+")}` : "";
  return `${base}?startgroup&${adminParam}`;
};

const normalizeText = (value) => String(value || "").trim();

const getTelegramConfig = async () => {
  const config = await getTelegramBotConfig();
  const botToken = normalizeText(process.env.TELEGRAM_BOT_TOKEN);

  return {
    botToken,
    logChatId: normalizeText(config.logChatId),
    supportChatId: normalizeText(config.supportChatId),
    startImage: normalizeText(config.startImage),
    enabled: Boolean(config.enabled && botToken),
    adminIds: Array.isArray(config.adminIds) ? config.adminIds : [],
  };
};

const buildInlineKeyboard = (buttons = [], columns = 2) => {
  const rows = [];
  for (let index = 0; index < buttons.length; index += columns) {
    const row = buttons.slice(index, index + columns).map((button) => {
      if (button.url) {
        return { text: button.text, url: button.url };
      }

      return { text: button.text, callback_data: button.data || button.text };
    });

    rows.push(row);
  }
  return rows;
};

const buildStartMenuKeyboard = (botUsername) => {
  const groupUrl = botUsername ? `https://t.me/${botUsername}?startgroup=true` : "https://t.me";

  return [
    [{ text: "About Me", data: START_MENU_DATA.ABOUT }],
    [
      { text: "Donate", data: START_MENU_DATA.DONATE },
      { text: "Commands", data: START_MENU_DATA.COMMANDS },
    ],
    [
      { text: "Support", data: START_MENU_DATA.SUPPORT },
      { text: "Updates", data: START_MENU_DATA.UPDATES },
    ],
    [
      { text: "Add Notes bot to your groups", url: botUsername ? buildAddToGroupUrl(botUsername) : "https://t.me" },
    ],
  ];
};

const buildJoinPromptKeyboard = (inviteLink) => {
  // Use pre-generated invite link as URL button
  return [
    [{ text: "Join Support Chat", url: inviteLink || "https://t.me" }],
    [{ text: "Verify Membership", data: START_MENU_DATA.VERIFY }],
  ];
};

const getJoinPromptCaption = () => [
  "Welcome! 👋",
  "",
  "To access Notes Bot features, please join our support community first.",
  "This helps us maintain quality and support.",
].join("\n");

const getStartMenuCaption = () => [
  "Hello There, My name's Notes Bot ✨",
  "I am a study notes assistant for students.",
  "Search, share, and manage notes from one place.",
].join("\n");

const getAboutText = () => [
  "About Notes Bot:",
  "",
  "• Search notes by subject, semester, branch, or keyword.",
  "• Share study notes in private chats or groups.",
  "• Admins can manage the bot from chat.",
].join("\n");

const getCommandsText = () => [
  "Commands:",
  "",
  "/start - show menu",
  "/search <query> - search notes",
  "/whoami - show your Telegram id",
].join("\n");

const getDonateText = () => "Donate: configure your donation link or payment method here later.";
const getSupportText = () => "Support: connect this button to your support chat or helpdesk link.";
const getUpdatesText = () => "Updates: connect this button to your updates channel or announcement page.";

const getDisplayName = (user) => {
  if (!user) return "Unknown";
  const nameParts = [user.first_name, user.last_name].filter(Boolean);
  if (nameParts.length) return nameParts.join(" ");
  if (user.username) return `@${user.username}`;
  return String(user.id || "Unknown");
};

const formatJoinMessage = (message) => {
  const chatName = message.chat?.title || message.chat?.username || "a chat";
  const members = Array.isArray(message.new_chat_members) ? message.new_chat_members : [];
  const names = members.length ? members.map(getDisplayName).join(", ") : getDisplayName(message.from);

  return `New member joined ${chatName}: ${names}`;
};

const isAdminUser = async (userId) => {
  const config = await getTelegramConfig();
  return config.adminIds.includes(String(userId));
};

const resolveTelegramChatId = async (target) => {
  const value = normalizeText(target);
  if (!value) return null;

  if (/^-?\d+$/.test(value)) {
    return value;
  }

  const handle = value.startsWith("@") ? value : value.replace(/^https?:\/\/t\.me\//i, "");
  const chat = await telegramBot.getChat(handle.startsWith("@") ? handle : `@${handle}`).catch(() => undefined);
  return chat?.id != null ? String(chat.id) : null;
};

const sendTelegramMessage = async (chatId, text, options = {}) => {
  if (!telegramBot) {
    throw new Error("Telegram bot is not started");
  }

  let replyMarkup;
  if (Array.isArray(options.buttons)) {
    if (Array.isArray(options.buttons[0])) {
      replyMarkup = {
        inline_keyboard: options.buttons.map((row) =>
          (Array.isArray(row) ? row : [row]).map((button) => {
            if (!button) return button;
            if (typeof button === "string") {
              return { text: button, callback_data: button };
            }
            if (button.url) return { text: button.text || "Open", url: button.url };
            const cb = button.callback_data || button.data || button.callback || button.action;
            if (cb) return { text: button.text || String(cb), callback_data: String(cb) };
            if (button.text) return { text: button.text, callback_data: button.text };
            return button;
          })
        ),
      };
    } else {
      replyMarkup = { inline_keyboard: buildInlineKeyboard(options.buttons, options.columns || 2) };
    }
  } else {
    replyMarkup = undefined;
  }

  const common = {
    disable_web_page_preview: true,
    reply_markup: replyMarkup,
  };

  if (options.parseMode) {
    common.parse_mode = options.parseMode === "md" ? "Markdown" : options.parseMode;
  }

  if (options.media) {
    try {
      return await telegramBot.sendPhoto(chatId, options.media, {
        caption: text,
        ...common,
      });
    } catch (error) {
      console.error("Telegram sendPhoto error:", error.message);
      return telegramBot.sendMessage(chatId, text, common);
    }
  }

  return telegramBot.sendMessage(chatId, text, common);
};

const notifyLogChannel = async (text) => {
  const { logChatId } = await getTelegramConfig();
  if (!logChatId) return;

  try {
    await sendTelegramMessage(logChatId, text);
  } catch (error) {
    console.error("Telegram log channel error:", error.message);
  }
};

const handleStartMenuAction = async (query, action) => {
  const textMap = {
    [START_MENU_DATA.ABOUT]: getAboutText(),
    [START_MENU_DATA.DONATE]: getDonateText(),
    [START_MENU_DATA.COMMANDS]: getCommandsText(),
    [START_MENU_DATA.SUPPORT]: getSupportText(),
    [START_MENU_DATA.UPDATES]: getUpdatesText(),
  };

  if (action === START_MENU_DATA.VERIFY) {
    const isMember = await isUserInSupportGroup(query.from?.id);
    if (!isMember) {
      await telegramBot.answerCallbackQuery(query.id, {
        text: "You are not yet a member of the support chat. Please join first!",
        show_alert: true,
      }).catch(() => undefined);
      return;
    }

    // Member verified - delete the join prompt message and show start menu
    const config = await getTelegramConfig();
    const messageId = query.message?.message_id;
    const chatId = query.message?.chat?.id;

    try {
      // Delete the current message
      await telegramBot.deleteMessage(chatId, messageId).catch(() => undefined);
    } catch (e) {
      console.error("Error deleting message:", e.message);
    }

    // Show the start menu
    const media = config.startImage || "https://placehold.co/800x300?text=Notes+Bot";

    await sendTelegramMessage(chatId, getStartMenuCaption(), {
      media,
      buttons: buildStartMenuKeyboard(telegramBotUsername),
      columns: 2,
    });

    await telegramBot.answerCallbackQuery(query.id, {
      text: "Welcome! Verification successful.",
      show_alert: false,
    }).catch(() => undefined);
    return;
  }

  if (action === "start:ask_join_link") {
    await telegramBot.answerCallbackQuery(query.id, {
      text: "Please contact the admin to get the support group join link.",
      show_alert: true,
    }).catch(() => undefined);
    return;
  }

  if (action === "start:generate_join_link") {
    await telegramBot.answerCallbackQuery(query.id, {
      text: "This button should not be clicked.",
      show_alert: true,
    }).catch(() => undefined);
    return;
  }

  
  await telegramBot.answerCallbackQuery(query.id, {
    text: textMap[action] || "",
    show_alert: true,
  }).catch(() => undefined);
};

const isUserInSupportGroup = async (userId) => {
  try {
    const cfg = await getTelegramConfig();
    if (!cfg.supportChatId) return true; // no support group configured => open access
    if (!telegramBot) return false;

    const member = await telegramBot.getChatMember(cfg.supportChatId, String(userId)).catch(() => undefined);
    if (!member || !member.status) return false;
    return ["member", "creator", "administrator"].includes(String(member.status));
  } catch (err) {
    console.error("isUserInSupportGroup error:", err?.message || err);
    return false;
  }
};

const generateSupportChatInviteLink = async (supportChatId) => {
  if (!supportChatId || !telegramBot) return null;
  
  try {
    // Try to create a new invite link
    const link = await telegramBot.createChatInviteLink(supportChatId, {
      creates_join_request: false,
    }).catch(() => undefined);
    if (link?.invite_link) return link.invite_link;
    
    // Fallback: export existing invite link
    const existingLink = await telegramBot.exportChatInviteLink(supportChatId).catch(() => undefined);
    if (existingLink) return existingLink;
    
    return null;
  } catch (err) {
    console.error("generateSupportChatInviteLink error:", err?.message || err);
    return null;
  }
};

const handleTelegramCallbackQuery = async (query) => {
  const action = normalizeText(query.data);
  console.log(`[callback] action=${action}, userId=${query.from?.id}`);
  // Handle all start-menu related callbacks
  if (String(action).startsWith("start:")) {
    console.log(`[callback] handling start action: ${action}`);
    await handleStartMenuAction(query, action);
  }
};

const handleTelegramMessage = async (message) => {
  try {
    const rawText = normalizeText(message.text);

  if (Array.isArray(message.new_chat_members) && message.new_chat_members.length) {
    await notifyLogChannel(formatJoinMessage(message));
  }

  if (!rawText) return;

  const chatId = message.chat?.id;
  if (chatId == null) return;

  // Access control: if support group is configured, allow only users who are members
  const isAdminCmd = /^\/(setlog|setstartimage|enablebot|disablebot|showconfig|adminhelp|setadmins|addadmin|removeadmin|setsupport)\b/i.test(rawText);
  const isPublicCmd = /^\/(start|help|whoami)\b/i.test(rawText);
  if (!isAdminCmd && !isPublicCmd) {
    const allowed = await isUserInSupportGroup(message.from?.id);
    if (!allowed) {
      const cfg = await getTelegramConfig();
      const supportLink = cfg.supportChatId && cfg.supportChatId.startsWith("@") ? `https://t.me/${cfg.supportChatId.replace(/^@/,"")}` : (cfg.supportChatId || "https://t.me");
      await sendTelegramMessage(chatId, `Access restricted. Please join our support group to use this command: ${supportLink}`);
      return;
    }
  }

  if (/^\/(start|help)(?:@\w+)?$/i.test(rawText)) {
    const config = await getTelegramConfig();
    const userId = message.from?.id;
    console.log(`[/start] userId=${userId}, supportChatId=${config.supportChatId}`);
    
    const isMember = await isUserInSupportGroup(userId);
    console.log(`[/start] isMember=${isMember}`);

    if (!isMember && config.supportChatId) {
      console.log(`[/start] Showing join prompt`);
      // User is not a member of support chat - generate invite link
      const inviteLink = await generateSupportChatInviteLink(config.supportChatId);
      console.log(`[/start] Generated invite link: ${inviteLink ? "success" : "failed"}`);
      
      const joinMessage = await sendTelegramMessage(chatId, getJoinPromptCaption(), {
        buttons: buildJoinPromptKeyboard(inviteLink),
        columns: 1,
      });
      return;
    }

    console.log(`[/start] Showing normal start menu`);
    // User is a member or no support chat is configured
    const media = config.startImage || "https://placehold.co/800x300?text=Notes+Bot";

    await sendTelegramMessage(chatId, getStartMenuCaption(), {
      media,
      buttons: buildStartMenuKeyboard(telegramBotUsername),
      columns: 2,
    });
    return;
  }

  if (/^\/whoami\b/i.test(rawText)) {
    await sendTelegramMessage(chatId, `Your Telegram id is: ${message.from?.id || "(unknown)"}\n\nTo become an admin, ask an existing admin to add this id with /addadmin or /setadmins.`);
    return;
  }

  if (
    /^\/setlog\b/i.test(rawText) ||
    /^\/setstartimage\b/i.test(rawText) ||
    /^\/setsupport\b/i.test(rawText) ||
    /^\/(enablebot|disablebot|showconfig|adminhelp|setadmins|addadmin|removeadmin)\b/i.test(rawText)
  ) {
    if (!(await isAdminUser(message.from?.id))) {
      await sendTelegramMessage(chatId, "You are not authorized to run admin commands.");
      return;
    }

    if (/^\/setlog\b/i.test(rawText)) {
      const arg = rawText.split(/\s+/).slice(1).join(" ").trim();
      if (!arg) {
        await sendTelegramMessage(chatId, "Usage: /setlog <@channelusername|t.me/link|numeric_id>");
        return;
      }

      const resolved = await resolveTelegramChatId(arg);
      if (!resolved) {
        await sendTelegramMessage(chatId, `Could not resolve '${arg}'.`);
        return;
      }

      await updateTelegramBotConfig({ logChatId: resolved });
      await sendTelegramMessage(chatId, `Updated log chat id = ${resolved}`);
      return;
    }

    if (/^\/setsupport\b/i.test(rawText)) {
      const arg = rawText.split(/\s+/).slice(1).join(" ").trim();
      if (!arg) {
        await sendTelegramMessage(chatId, "Usage: /setsupport <@groupusername|t.me/link|numeric_id>");
        return;
      }

      const resolved = await resolveTelegramChatId(arg);
      if (!resolved) {
        await sendTelegramMessage(chatId, `Could not resolve '${arg}'.`);
        return;
      }

      await updateTelegramBotConfig({ supportChatId: resolved });
      await sendTelegramMessage(chatId, `Updated support group id = ${resolved}`);
      return;
    }

    if (/^\/setstartimage\b/i.test(rawText)) {
      const arg = rawText.split(/\s+/).slice(1).join(" ").trim();
      if (!arg) {
        await sendTelegramMessage(chatId, "Usage: /setstartimage <image_url>");
        return;
      }

      await updateTelegramBotConfig({ startImage: arg });
      await sendTelegramMessage(chatId, "Updated start image.");
      return;
    }

    if (/^\/setadmins\b/i.test(rawText)) {
      const payload = rawText.replace(/^\/setadmins(?:@\w+)?\s*/i, "").trim();
      if (!payload) {
        await sendTelegramMessage(chatId, "Usage: /setadmins <id1,id2,id3>");
        return;
      }

      const adminIds = payload.split(",").map((id) => id.trim()).filter(Boolean);
      await setTelegramAdminIds(adminIds);
      await sendTelegramMessage(chatId, `Updated admin list in DB (${adminIds.length} ids).`);
      return;
    }

    if (/^\/addadmin\b/i.test(rawText)) {
      const adminId = rawText.split(/\s+/)[1];
      if (!adminId) {
        await sendTelegramMessage(chatId, "Usage: /addadmin <id>");
        return;
      }

      await addTelegramAdminId(adminId);
      await sendTelegramMessage(chatId, `Added admin id ${adminId}`);
      return;
    }

    if (/^\/removeadmin\b/i.test(rawText)) {
      const adminId = rawText.split(/\s+/)[1];
      if (!adminId) {
        await sendTelegramMessage(chatId, "Usage: /removeadmin <id>");
        return;
      }

      await removeTelegramAdminId(adminId);
      await sendTelegramMessage(chatId, `Removed admin id ${adminId}`);
      return;
    }

    if (/^\/enablebot\b/i.test(rawText)) {
      await updateTelegramBotConfig({ enabled: true });
      await sendTelegramMessage(chatId, "Bot enabled.");
      if (!telegramBot) {
        await startTelegramBot();
      }
      return;
    }

    if (/^\/disablebot\b/i.test(rawText)) {
      await updateTelegramBotConfig({ enabled: false });
      await sendTelegramMessage(chatId, "Bot disabled.");
      await stopTelegramBot();
      return;
    }

    if (/^\/showconfig\b/i.test(rawText)) {
      const cfg = await getTelegramConfig();
      const out = [
        `Bot Enabled: ${cfg.enabled}`,
        `Log Chat ID: ${cfg.logChatId || "(not set)"}`,
        `Support Chat ID: ${cfg.supportChatId || "(not set)"}`,
        `Start Image: ${cfg.startImage || "(not set)"}`,
        `Admin IDs: ${cfg.adminIds.length ? cfg.adminIds.map((id) => String(id)).join(", ") : "(not set)"}`,
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
        "/setadmins <id1,id2> — replace admin list",
        "/addadmin <id> — add one admin id",
        "/removeadmin <id> — remove one admin id",
        "/enablebot — enable bot in DB and start it",
        "/disablebot — disable bot in DB and stop it",
        "/showconfig — show basic config",
      ].join("\n");

      await sendTelegramMessage(chatId, help);
      return;
    }
  }

  if (/^\/search(?:@\w+)?/i.test(rawText)) {
    const query = rawText.replace(/^\/search(?:@\w+)?\s*/i, "").trim();

    if (!query) {
      await sendTelegramMessage(chatId, "Use /search followed by a subject, semester, branch, or keyword.");
      return;
    }

    const notes = await searchNotesByQuery(query);
    const responseText = formatTelegramSearchResults(query, notes);

    await sendTelegramMessage(chatId, responseText);
  }
  } catch (err) {
    console.error("Error handling telegram message:", err);
    try {
      await notifyLogChannel(`Telegram handler error: ${err.stack || err.message}`);
    } catch (e) {
      // ignore logging errors
    }
  }
};

const startTelegramBot = async () => {
  await ensureTelegramBotConfig();
  const { enabled, botToken } = await getTelegramConfig();

  if (!enabled) {
    console.log("Telegram bot is disabled. Store settings in the database and keep only TELEGRAM_BOT_TOKEN in env.");
    return;
  }

  if (telegramBot) {
    return;
  }

  telegramBot = new TelegramBot(botToken, {
    polling: {
      autoStart: true,
      params: {
        timeout: 20,
      },
    },
  });

  telegramBot.on("message", (msg) => {
    handleTelegramMessage(msg).catch(async (err) => {
      console.error("Telegram message handler error:", err);
      try {
        await notifyLogChannel(`Telegram message handler error: ${err.stack || err.message}`);
      } catch (e) {
        // ignore
      }
    });
  });

  telegramBot.on("callback_query", (q) => {
    handleTelegramCallbackQuery(q).catch(async (err) => {
      console.error("Telegram callback handler error:", err);
      try {
        await notifyLogChannel(`Telegram callback handler error: ${err.stack || err.message}`);
      } catch (e) {
        // ignore
      }
    });
  });
  telegramBot.on("polling_error", (error) => {
    console.error("Telegram polling error:", error.message);
  });

  const me = await telegramBot.getMe().catch(() => undefined);
  telegramBotUsername = me?.username || "";

  console.log("Telegram bot connected with Bot API.");
};

const stopTelegramBot = async () => {
  if (!telegramBot) {
    return;
  }

  telegramBot.removeAllListeners();

  try {
    await telegramBot.stopPolling();
  } catch (error) {
    console.error("Telegram bot stopPolling error:", error.message);
  }

  telegramBot = undefined;
  telegramBotUsername = "";
};

const getTelegramBotStatus = async () => {
  const cfg = await getTelegramConfig();

  return {
    enabled: cfg.enabled,
    connected: Boolean(telegramBot),
    hasLogChannel: Boolean(cfg.logChatId),
  };
};

export {
  getTelegramBotStatus,
  sendTelegramMessage,
  startTelegramBot,
  stopTelegramBot,
};
