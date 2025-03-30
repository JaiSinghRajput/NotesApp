import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { uploadOnCloudinary } from "../utils/index.js";
import { Note } from "../models/notes.models.js";
import { User } from "../models/user.models.js";
import fs from "fs";
// import path from "path";


const uploadPdf = asyncHandler(async (req) => {
  // console.log(req);
  const { file } = req;
  if (!file) {
    throw new ApiError(400, "No file uploaded");
  }
  const { path: filePath } = file;
  const uploadRes = await uploadOnCloudinary(filePath);

  // Remove the temporary file after upload
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error removing temporary file:", error);
  }

  if (!uploadRes) throw new ApiError(500, "Error uploading file");
  return uploadRes;
});

const handleUpload = asyncHandler(async (req, res) => {
  const { title, description, category, tags } = req.body;
  if (!title || !description || !category) throw new ApiError(400, "All fields are required");

  const user = await User.findById(req.user._id);
  if(user.role === "user") throw new ApiError(403, "Unauthorized access");

  const uploadRes = await uploadPdf(req);
  
  const note = await Note.create({
    title,
    description,
    category,
    tags,
    fileUrl: uploadRes.secure_url,
    uploadedBy: req?.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, note, "Note uploaded successfully"));
});

export { handleUpload };