import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { Note } from "../models/notes.models.js";
import fs from "fs";
// import path from "path";
const handleUpload = asyncHandler(async (req, res) => {
  const { title, description, category, tags } = req.body;
  const { file } = req;

  if (!title || !description || !category) {
    throw new ApiError(400, "Title, description, and category are required");
  }
  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }
  let fileUrl;
  try {
    const uploadRes = await uploadOnCloudinary(file.path);
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
  const Extractedtags = tags.split(",").map((tag) => tag.trim());

try {
    const note = await Note.create({
      title,
      description,
      category,
      tags:Extractedtags,
      fileUrl,
      uploadedBy: req.user._id,
    });
    return res.status(201).json(new ApiResponse(201,"Note uploaded successfully",note));
} catch (error) {
  public_id = uploadRes.public_id;
  await deleteFromCloudinary(public_id);
  throw new ApiError(500, error.message);
}

});
const handleDelete = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log(req.params)

  // Find the note
  const note = await Note.findById({_id:id});
  if (!note) throw new ApiError(404, "Note not found");

  // Check if the user is authorized to delete this note
  if (note.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this note");
  }

  // Extract public_id from fileUrl correctly
  const urlParts = note.fileUrl.split("/");
  const publicId = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1].split(".")[0]}`;

  // Delete file from Cloudinary
  const status = await deleteFromCloudinary(publicId);
  if (!status) throw new ApiError(500, "Error deleting file from Cloudinary");

  // Delete the note from the database
  await Note.findByIdAndDelete({_id:id});

  return res.status(200).json(new ApiResponse(200, {}, "Note deleted successfully"));
});

const getAllNotes = asyncHandler(async (req, res) => {
  try {
    const notes = await Note.find();
    if (notes.length === 0) throw new ApiError(404, "No notes found");
    return res.status(200).json(new ApiResponse(200, "All notes retrieved", notes));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
const getNoteFileUrl = asyncHandler(async (req, res) => {
  const { _id } = req.params;
  const note = await Note.findById(_id);
  if (!note) throw new ApiError(404, "Note not found");
  return res.status(200).json(new ApiResponse(200, { fileUrl: note.fileUrl }, "File URL retrieved"));
});

const searchNotes = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    throw new ApiError(400, "Search query is required");
  }
  const notes = await Note.find({
    $or: [
      { title: { $regex: query, $options: "i" } }, // Case-insensitive search in title
      { description: { $regex: query, $options: "i" } }, // Search in description
      { category: { $regex: query, $options: "i" } }, // Search in category
    ],
  });
  return res.status(200).json(new ApiResponse(200, "Search results retrieved", notes));
});
const getUserNotes = asyncHandler(async (req, res) => {
  const { _id } = req.params;

  const notes = await Note.find({ uploadedBy: _id }).sort({ createdAt: -1 });
  if (!notes.length === 0) throw new ApiError(404, "No notes uploaded by this user");
  return res.status(200).json(new ApiResponse(200, "User's notes retrieved successfully", notes));
});
export {
  handleUpload,
  handleDelete,
  getAllNotes,
  getNoteFileUrl,
  searchNotes,
  getUserNotes,
};