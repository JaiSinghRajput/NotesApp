import {
  ApiError,
  ApiResponse,
  asyncHandler,
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/index.js";
import { Note } from "../models/index.js";
import fs from "fs";
import {
  buildPdfSignature,
  hammingDistanceHex64,
  jaccardSimilarity,
} from "../utils/duplicateDetector.js";
import { buildSearchConditions } from "../services/noteSearch.service.js";

// ================== UPLOAD NOTE ==================
const handleUpload = asyncHandler(async (req, res) => {
  const { title, description, course, branch, semester, category, unit, tags } = req.body;
  const { file } = req;
  const enableAiDuplicateCheck =
    (process.env.ENABLE_AI_DUPLICATE_CHECK || "true").toLowerCase() === "true";
  const similarityThreshold = Number(process.env.DUPLICATE_SIMILARITY_THRESHOLD || 0.9);

  if (req.user.role !== 'admin') {
    throw new ApiError(403, "Only admins can upload notes");
  }

  if (!title || !description || !course || !branch || !semester || !category || !unit) {
    throw new ApiError(400, "Title, description, course, branch, semester, subject, and unit are required");
  }

  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }

  const extractedTags = tags ? tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];

  let signature;
  let fileUrl;
  let uploadRes;

  try {
    signature = await buildPdfSignature(file.path);

    const exactDuplicate = await Note.findOne({ pdfSha256: signature.sha256 })
      .select("_id title uploadedBy")
      .populate("uploadedBy", "name email");

    if (exactDuplicate) {
      throw new ApiError(
        409,
        `Duplicate PDF detected. Existing note: ${exactDuplicate.title} (${exactDuplicate._id})`
      );
    }

    if (enableAiDuplicateCheck && signature.simhash) {
      const candidates = await Note.find({ pdfSimhash: { $exists: true, $ne: null } })
        .select("_id title description tags pdfSimhash")
        .limit(300);

      const incomingMeta = `${title} ${description || ""} ${extractedTags.join(" ")}`;
      let bestCandidate = null;
      let bestScore = 0;

      for (const candidate of candidates) {
        if (!candidate.pdfSimhash) continue;

        const distance = hammingDistanceHex64(signature.simhash, candidate.pdfSimhash);
        const simhashSimilarity = Math.max(0, 1 - distance / 64);
        const candidateMeta = `${candidate.title} ${candidate.description || ""} ${(candidate.tags || []).join(" ")}`;
        const metadataSimilarity = jaccardSimilarity(incomingMeta, candidateMeta);

        const score = simhashSimilarity * 0.75 + metadataSimilarity * 0.25;
        if (score > bestScore) {
          bestScore = score;
          bestCandidate = candidate;
        }
      }

      if (bestCandidate && bestScore >= similarityThreshold) {
        throw new ApiError(
          409,
          `Potential duplicate detected (score: ${bestScore.toFixed(3)}). Similar note ID: ${bestCandidate._id}`
        );
      }
    }

    uploadRes = await uploadOnCloudinary(file.path);
    if (!uploadRes?.secure_url) {
      throw new ApiError(500, "Error uploading file to Cloudinary");
    }
    fileUrl = uploadRes.secure_url;
  } catch (error) {
    if (uploadRes?.public_id) {
      await deleteFromCloudinary(uploadRes.public_id);
    }
    throw error;
  } finally {
    // Always attempt to delete the temporary file
    try {
      await fs.promises.unlink(file.path);
    } catch (error) {
      console.error("Error removing temporary file:", error);
    }
  }

  try {
    const note = await Note.create({
      title,
      description,
      course,
      branch,
      semester,
      category,
      unit,
      tags: extractedTags,
      filePublicId: uploadRes.public_id,
      fileUrl,
      pdfSha256: signature?.sha256,
      pdfSimhash: signature?.simhash,
      pdfTextSampleLength: signature?.extractedText?.length || 0,
      duplicateCheckMeta: {
        method: enableAiDuplicateCheck ? "hash+similarity" : "hash-only",
        score: 0,
      },
      uploadedBy: req.user._id,
    });

    // Populate uploadedBy so frontend immediately gets username/email
    const populatedNote = await note.populate("uploadedBy", "name email");

    return res
      .status(201)
      .json(new ApiResponse(201, populatedNote, "Note uploaded successfully"));
  } catch (error) {
    if (uploadRes?.public_id) {
      await deleteFromCloudinary(uploadRes.public_id);
    }
    throw new ApiError(500, error.message);
  }
});

// ================== DELETE NOTE ==================
const handleDelete = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const note = await Note.findById(id);
    if (!note) throw new ApiError(404, "Note not found");

    // Allow only uploader OR super-admin
    if (
      note.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "super-admin"
    ) {
      throw new ApiError(403, "You are not authorized to delete this note");
    }

    // Delete file from Cloudinary
    if (note.filePublicId) {
      const { result } = await deleteFromCloudinary(note.filePublicId);
      if (result !== "ok") {
        throw new ApiError(500, "Error deleting file from Cloudinary");
      }
    }

    // Delete the note from DB
    await Note.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Note deleted successfully"));
  } catch (error) {
    next(error);
  }
});

// ================== SEARCH NOTES ==================
const searchNotes = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const conditions = buildSearchConditions(query);

  const notes = await Note.find({ $or: conditions }).populate(
    "uploadedBy",
    "name email"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Search results retrieved"));
});

// ================== GET NOTE BY ID ==================
const getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await Note.findById(id).populate("uploadedBy", "name email");

  if (!note) throw new ApiError(404, "Note not found");

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note retrieved successfully"));
});

const buildAcademicFilter = (query) => {
  const filter = {};

  if (query.course) filter.course = query.course;
  if (query.branch) filter.branch = query.branch;
  if (query.semester) filter.semester = query.semester;
  if (query.subject || query.category) filter.category = query.subject || query.category;
  if (query.unit) filter.unit = query.unit;

  return filter;
};

export { handleUpload, handleDelete, searchNotes, getNoteById, buildAcademicFilter };
