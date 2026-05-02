import { BotConfig } from "../models/index.js";

const BOT_CONFIG_KEY = "telegram";

const parseBoolean = (value, fallback = false) => {
  if (value == null) return fallback;
  return ["true", "1", "yes", "on"].includes(String(value).trim().toLowerCase());
};

const parseAdminIds = (value = "") =>
  String(value)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const seedFromEnv = () => ({
  key: BOT_CONFIG_KEY,
  logChatId: process.env.TELEGRAM_LOG_CHAT_ID?.trim() || "",
  supportChatId: process.env.TELEGRAM_SUPPORT_CHAT_ID?.trim() || "",
  updatesChatId: process.env.TELEGRAM_UPDATES_CHAT_ID?.trim() || "",
  startImage: process.env.NOTES_BOT_START_IMAGE?.trim() || "",
  enabled: parseBoolean(process.env.TELEGRAM_BOT_ENABLED, true),
  adminIds: parseAdminIds(process.env.TELEGRAM_ADMIN_IDS),
});

const normalizeConfig = (doc) => {
  if (!doc) {
    return null;
  }

  const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    key: plain.key || BOT_CONFIG_KEY,
    logChatId: plain.logChatId || "",
    supportChatId: plain.supportChatId || "",
    updatesChatId: plain.updatesChatId || "",
    startImage: plain.startImage || "",
    enabled: typeof plain.enabled === "boolean" ? plain.enabled : true,
    adminIds: Array.isArray(plain.adminIds) ? plain.adminIds : [],
  };
};

const ensureTelegramBotConfig = async () => {
  let config = await BotConfig.findOne({ key: BOT_CONFIG_KEY });
  if (!config) {
    config = await BotConfig.create(seedFromEnv());
  }

  return normalizeConfig(config);
};

const getTelegramBotConfig = async () => ensureTelegramBotConfig();

const updateTelegramBotConfig = async (updates = {}) => {
  const current = await ensureTelegramBotConfig();

  const next = {
    ...current,
    ...updates,
    key: BOT_CONFIG_KEY,
  };

  const updated = await BotConfig.findOneAndUpdate(
    { key: BOT_CONFIG_KEY },
    { $set: next },
    { new: true }
  );

  return normalizeConfig(updated);
};

const setTelegramAdminIds = async (adminIds = []) => updateTelegramBotConfig({ adminIds: adminIds.map((id) => String(id).trim()).filter(Boolean) });

const addTelegramAdminId = async (adminId) => {
  const current = await ensureTelegramBotConfig();
  const nextAdminIds = Array.from(new Set([...(current.adminIds || []), String(adminId).trim()].filter(Boolean)));
  return updateTelegramBotConfig({ adminIds: nextAdminIds });
};

const removeTelegramAdminId = async (adminId) => {
  const current = await ensureTelegramBotConfig();
  const nextAdminIds = (current.adminIds || []).filter((id) => id !== String(adminId).trim());
  return updateTelegramBotConfig({ adminIds: nextAdminIds });
};

export {
  addTelegramAdminId,
  ensureTelegramBotConfig,
  getTelegramBotConfig,
  parseAdminIds,
  removeTelegramAdminId,
  setTelegramAdminIds,
  updateTelegramBotConfig,
};
