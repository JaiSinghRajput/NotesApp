import {
  ApiError,
  ApiResponse,
  asyncHandler,
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/index.js";
import { Note } from "../models/index.js";
import fs from "fs";

// ================== UPLOAD NOTE ==================
const handleUpload = asyncHandler(async (req, res) => {
  const { title, description, category, tags } = req.body;
  const { file } = req;

  if (req.user.role !== 'admin') {
    throw new ApiError(403, "Only admins can upload notes");
  }

  if (!title || !description || !category) {
    throw new ApiError(400, "Title, description, and category are required");
  }

  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }

  let fileUrl;
  let uploadRes;

  try {
    uploadRes = await uploadOnCloudinary(file.path);
    if (!uploadRes?.secure_url) {
      throw new ApiError(500, "Error uploading file to Cloudinary");
    }
    fileUrl = uploadRes.secure_url;
  } finally {
    // Always attempt to delete the temporary file
    try {
      await fs.promises.unlink(file.path);
    } catch (error) {
      console.error("Error removing temporary file:", error);
    }
  }

  const ExtractedTags = tags ? tags.split(",").map((tag) => tag.trim()) : [];

  try {
    const note = await Note.create({
      title,
      description,
      category,
      tags: ExtractedTags,
      filePublicId: uploadRes.public_id,
      fileUrl,
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

  // Dynamic search conditions
  const conditions = [
    { title: { $regex: query, $options: "i" } },
    { description: { $regex: query, $options: "i" } },
    { category: { $regex: `^${query}$`, $options: "i" } },
    { tags: { $in: [new RegExp(query, "i")] } },
  ];

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

export { handleUpload, handleDelete, searchNotes, getNoteById };
