import crypto from "crypto";
import fs from "fs";

const HASH_HEX_LENGTH = 16; // 64-bit from SHA-256 prefix
const SIMHASH_BITS = 64;

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();

const tokenize = (value = "") => normalizeText(value).split(" ").filter(Boolean);

const toHex64 = (value = "") =>
  crypto.createHash("sha256").update(value).digest("hex").slice(0, HASH_HEX_LENGTH);

const hex64ToBigInt = (hex64) => BigInt(`0x${hex64}`);

const extractLikelyPdfText = (buffer) => {
  const latin1 = buffer.toString("latin1");
  const chunks = [];

  // Capture strings inside PDF literal text operators e.g. (Hello World)
  const parenthesized = /\(([^()]{2,})\)/g;
  let match = parenthesized.exec(latin1);
  while (match) {
    const cleaned = match[1]
      .replace(/\\[nr]/g, " ")
      .replace(/\\\d{3}/g, " ")
      .trim();
    if (cleaned.length > 2) chunks.push(cleaned);
    match = parenthesized.exec(latin1);
  }

  // Fallback: extract visible ASCII sequences from binary
  const visibleAscii = latin1.match(/[A-Za-z0-9 ,.;:_\-()]{6,}/g) || [];
  chunks.push(...visibleAscii.slice(0, 1000));

  return normalizeText(chunks.join(" "));
};

const computeSimhash = (text) => {
  const tokens = tokenize(text);
  if (!tokens.length) return null;

  const freq = new Map();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  const vector = new Array(SIMHASH_BITS).fill(0);

  for (const [token, weight] of freq.entries()) {
    const tokenHash = hex64ToBigInt(toHex64(token));
    for (let i = 0; i < SIMHASH_BITS; i += 1) {
      const bit = (tokenHash >> BigInt(i)) & 1n;
      vector[i] += bit === 1n ? weight : -weight;
    }
  }

  let fingerprint = 0n;
  for (let i = 0; i < SIMHASH_BITS; i += 1) {
    if (vector[i] >= 0) {
      fingerprint |= 1n << BigInt(i);
    }
  }

  return fingerprint.toString(16).padStart(HASH_HEX_LENGTH, "0");
};

const hammingDistanceHex64 = (a, b) => {
  if (!a || !b) return SIMHASH_BITS;
  let x = hex64ToBigInt(a) ^ hex64ToBigInt(b);
  let count = 0;
  while (x > 0n) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
};

const jaccardSimilarity = (left, right) => {
  const leftSet = new Set(tokenize(left));
  const rightSet = new Set(tokenize(right));

  if (!leftSet.size && !rightSet.size) return 0;

  let intersection = 0;
  for (const word of leftSet) {
    if (rightSet.has(word)) intersection += 1;
  }

  const union = leftSet.size + rightSet.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

const buildPdfSignature = async (filePath) => {
  const buffer = await fs.promises.readFile(filePath);
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const extractedText = extractLikelyPdfText(buffer);
  const simhash = computeSimhash(extractedText);

  return {
    sha256,
    simhash,
    extractedText,
  };
};

export { buildPdfSignature, hammingDistanceHex64, jaccardSimilarity };
