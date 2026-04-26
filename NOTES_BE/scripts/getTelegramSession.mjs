import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import telegramPkg from "telegram";
import sessionsPkg from "telegram/sessions/index.js";

const { TelegramClient } = telegramPkg;
const { StringSession } = sessionsPkg;

// Try to load the main .env file from the NOTES_BE folder first, then fall back
// to NOTES_BE/sample.env or process.cwd() locations.
const candidates = [
  path.resolve(process.cwd(), "NOTES_BE/.env"),
  path.resolve(process.cwd(), "NOTES_BE/sample.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "sample.env"),
];

let loadedPath = null;
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    loadedPath = p;
    break;
  }
}

if (loadedPath) {
  console.log("Loaded env from:", loadedPath);
} else {
  console.log("No .env found in expected locations; relying on process.env");
}

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH;
const botToken = process.env.TELEGRAM_BOT_TOKEN;

async function main() {
  if (!apiId || !apiHash || !botToken) {
    console.error(
      "Missing env vars. Set TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_BOT_TOKEN."
    );
    process.exit(1);
  }

  const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({ botAuthToken: botToken });
    // Print the session string to save for future restarts
    console.log("=== TELEGRAM SESSION STRING ===\n" + client.session.save());
  } catch (err) {
    console.error("Failed to start Telegram client:", err.message || err);
    process.exit(1);
  } finally {
    try {
      await client.disconnect();
    } catch (e) {}
  }
}

void main();
