import { Note } from "../models/index.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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