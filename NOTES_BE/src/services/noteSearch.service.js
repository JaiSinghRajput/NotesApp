import { Note } from "../models/index.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSearchConditions = (query) => {
  const raw = String(query || "").trim();
  if (!raw) return [];

  const tokens = raw.split(/\s+/).map((t) => escapeRegex(t)).filter(Boolean);

  // Build a regex that requires all tokens to appear (in any order) for better fuzzy matching
  const allTokensRegex = tokens.length > 1 ? tokens.map((t) => `(?=.*${t})`).join("") + ".*" : tokens[0];
  const regexAll = new RegExp(allTokensRegex, "i");
  const regexAny = new RegExp(tokens.join("|"), "i");

  return [
    { title: { $regex: regexAll } },
    { description: { $regex: regexAll } },
    { course: { $regex: regexAny } },
    { branch: { $regex: regexAny } },
    { semester: { $regex: regexAny } },
    { category: { $regex: regexAny } },
    { unit: { $regex: regexAny } },
    { tags: { $in: tokens.map((t) => new RegExp(t, "i")) } },
  ];
};

const searchNotesByQuery = async (query) => {
  if (!query || !query.trim()) {
    return [];
  }

  return Note.find({ $or: buildSearchConditions(query) }).populate("uploadedBy", "name email");
};

const formatNoteForTelegram = (note, index) => {
  const uploadedBy = note.uploadedBy?.name || note.uploadedBy?.email || "Unknown";
  const tags = Array.isArray(note.tags) && note.tags.length ? note.tags.join(", ") : "None";

  return [
    `${index}. ${note.title}`,
    `Course: ${note.course} | Branch: ${note.branch} | Semester: ${note.semester}`,
    `Subject: ${note.category} | Unit: ${note.unit}`,
    `Tags: ${tags}`,
    `By: ${uploadedBy}`,
    `Link: ${note.fileUrl}`,
  ].join("\n");
};

const formatTelegramSearchResults = (query, notes) => {
  if (!notes.length) {
    return `No notes found for "${query}".`;
  }

  const preview = notes.slice(0, 5).map((note, index) => formatNoteForTelegram(note, index + 1));
  const suffix = notes.length > 5 ? `\n\nShowing 5 of ${notes.length} results.` : "";

  return [`Search results for "${query}":`, "", ...preview].join("\n\n") + suffix;
};

export {
  buildSearchConditions,
  searchNotesByQuery,
  formatTelegramSearchResults,
};