import { Note } from "../models/index.js";
import { ApiResponse,ApiError,asyncHandler } from "../utils/index.js"
const getAllNotes = asyncHandler(async (req, res,next) => {
    try {
      const notes = await Note.find();
      if (notes.length === 0) throw new ApiError(404, "No notes found");
      return res.status(200).json(new ApiResponse(200, "All notes retrieved", notes));
    } catch (error) {
      next(error);
    }
  });

const getUserNotes = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const notes = await Note.find({ uploadedBy: id||req.user?._id}).sort({ createdAt: -1 });
    if (notes.length === 0) throw new ApiError(404, "No notes uploaded by this user");
    return res.status(200).json(new ApiResponse(200, "User's notes retrieved successfully", notes));
  });
  export {
    getAllNotes,
    getUserNotes
  }