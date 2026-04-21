import { Note } from "../models/index.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildSearchConditions = (query) => {
  const safeQuery = escapeRegex(query.trim());

  return [
    { title: { $regex: safeQuery, $options: "i" } },
    { description: { $regex: safeQuery, $options: "i" } },
    { course: { $regex: safeQuery, $options: "i" } },
    { branch: { $regex: safeQuery, $options: "i" } },
    { semester: { $regex: safeQuery, $options: "i" } },
    { category: { $regex: `^${safeQuery}$`, $options: "i" } },
    { unit: { $regex: safeQuery, $options: "i" } },
    { tags: { $in: [new RegExp(safeQuery, "i")] } },
  ];
};

const searchNotesByQuery = async (query) => {
  if (!query || !query.trim()) {
    return [];
  }

  return Note.find({ $or: buildSearchConditions(query) }).populate("uploadedBy", "name email");
};

const formatNoteForTelegram = (note, index) => {
  const uploadedBy = escapeHtml(note.uploadedBy?.name || note.uploadedBy?.email || "Unknown");
  const tags = escapeHtml(Array.isArray(note.tags) && note.tags.length ? note.tags.join(", ") : "None");

  return [
    `${index}. ${escapeHtml(note.title)}`,
    `Course: ${escapeHtml(note.course)} | Branch: ${escapeHtml(note.branch)} | Semester: ${escapeHtml(note.semester)}`,
    `Subject: ${escapeHtml(note.category)} | Unit: ${escapeHtml(note.unit)}`,
    `Tags: ${tags}`,
    `By: ${uploadedBy}`,
    `Link: ${escapeHtml(note.fileUrl)}`,
  ].join("\n");
};

const formatTelegramSearchResults = (query, notes) => {
  if (!notes.length) {
    return `No notes found for "${escapeHtml(query)}".`;
  }

  const preview = notes.slice(0, 5).map((note, index) => formatNoteForTelegram(note, index + 1));
  const suffix = notes.length > 5 ? `\n\nShowing 5 of ${notes.length} results.` : "";

  return [`Search results for "${escapeHtml(query)}":`, "", ...preview].join("\n\n") + suffix;
};

export {
  buildSearchConditions,
  searchNotesByQuery,
  formatTelegramSearchResults,
};