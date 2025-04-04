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
  const Extractedtags = tags.split(",").map((tag) => tag.trim());

try {
    const note = await Note.create({
      title,
      description,
      category,
      tags:Extractedtags,
      filePublicId: uploadRes.public_id,
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

  // Find the note
  try {
    const note = await Note.findById({_id:id});
    if (!note) throw new ApiError(404, "Note not found");
  
    // Check if the user is authorized to delete this note
    if (note.uploadedBy.toString() !== req.user._id.toString() || req.user.role !== "super-admin") {
      throw new ApiError(403, "You are not authorized to delete this note");
    }

    // Delete file from Cloudinary
    const {result } = await deleteFromCloudinary(note.filePublicId);
    if (result!="ok") throw new ApiError(500, "Error deleting file from Cloudinary");
  
    // Delete the note from the database
    await Note.findByIdAndDelete({_id:id});
    return res.status(200).json(new ApiResponse(200, {}, "Note deleted successfully"));
  } catch (error) {
    next(error);
  }
});
const getNoteFileUrl = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await Note.findById({_id:id});
  if (!note) throw new ApiError(404, "Note not found");
  return res.status(200).json(new ApiResponse(200,"File URL retrieved",{ fileUrl: note.fileUrl }));
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
export {
  handleUpload,
  handleDelete,
  getNoteFileUrl,
  searchNotes,
};