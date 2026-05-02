import "dotenv/config";
import connectDB from "../src/config/database.js";
import { BotConfig } from "../src/models/index.js";

const BOT_CONFIG_KEY = "telegram";

const parseArgs = (argv) => {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }
  return args;
};

const parseList = (value = "") =>
  String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseBoolean = (value, fallback = undefined) => {
  if (value == null) return fallback;
  return ["true", "1", "yes", "on"].includes(String(value).trim().toLowerCase());
};

const printHelp = () => {
  console.log([
    "Usage:",
    "  node scripts/setTelegramConfig.mjs [--log-chat-id <id>] [--start-image <url>] [--enabled true|false] [--admin-ids id1,id2]",
    "",
    "Examples:",
    "  node scripts/setTelegramConfig.mjs --log-chat-id -1001234567890 --admin-ids 111,222",
    "",
    "You can also provide values through env vars:",
    "  TELEGRAM_LOG_CHAT_ID, NOTES_BOT_START_IMAGE, TELEGRAM_BOT_ENABLED, TELEGRAM_ADMIN_IDS",
  ].join("\n"));
};

const main = async () => {
  const args = parseArgs(process.argv);

  if (args.help || args.h) {
    printHelp();
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in the environment");
  }

  const updates = {
    key: BOT_CONFIG_KEY,
    logChatId: args["log-chat-id"] ?? process.env.TELEGRAM_LOG_CHAT_ID ?? undefined,
    startImage: args["start-image"] ?? process.env.NOTES_BOT_START_IMAGE ?? undefined,
    enabled: parseBoolean(args.enabled ?? process.env.TELEGRAM_BOT_ENABLED, undefined),
    adminIds: args["admin-ids"] ? parseList(args["admin-ids"]) : parseList(process.env.TELEGRAM_ADMIN_IDS),
  };

  await connectDB();

  const current = await BotConfig.findOne({ key: BOT_CONFIG_KEY });
  const next = {
    key: BOT_CONFIG_KEY,
    ...(current?.toObject?.() || {}),
  };

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    next[key] = value;
  }

  const saved = await BotConfig.findOneAndUpdate(
    { key: BOT_CONFIG_KEY },
    { $set: next },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Telegram config saved to MongoDB:");
  console.log(JSON.stringify(saved.toObject(), null, 2));
};

main().catch((error) => {
  console.error("Failed to save Telegram config:", error.message || error);
  process.exit(1);
});
