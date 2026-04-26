import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import telegramPkg from 'telegram';
import sessionsPkg from 'telegram/sessions/index.js';

const { TelegramClient } = telegramPkg;
const { StringSession } = sessionsPkg;

// load .env from NOTES_BE if present, else fall back to sample.env
const candidates = [
  path.resolve(process.cwd(), 'NOTES_BE/.env'),
  path.resolve(process.cwd(), 'NOTES_BE/sample.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'sample.env'),
];
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    console.log('Loaded env from:', p);
    break;
  }
}

const target = process.argv[2] || process.env.CHANNEL;
if (!target) {
  console.error('Provide channel username or t.me link as first argument. Example: https://t.me/jai_production or @jai_production');
  process.exit(1);
}

async function main() {
  const apiId = Number(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const session = process.env.TELEGRAM_SESSION || '';

  if (!apiId || !apiHash || !botToken) {
    console.error('Missing TELEGRAM_API_ID, TELEGRAM_API_HASH or TELEGRAM_BOT_TOKEN in env');
    process.exit(1);
  }

  const client = new TelegramClient(new StringSession(session), apiId, apiHash, { connectionRetries: 5 });

  try {
    await client.start({ botAuthToken: botToken });
  } catch (err) {
    console.error('Failed to start Telegram client:', err?.message || err);
    process.exit(1);
  }

  try {
    const entity = await client.getEntity(target);
    const idStr = String(entity?.id ?? '');
    console.log('entity.id =', idStr);
    console.log('Bot chat id =', idStr ? `-100${idStr}` : 'unknown');
  } catch (err) {
    console.error('Failed to resolve entity:', err?.message || err);
    process.exit(1);
  } finally {
    try { await client.disconnect(); } catch (e) {}
  }
}

void main();
