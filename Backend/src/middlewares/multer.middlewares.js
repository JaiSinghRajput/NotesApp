import multer from "multer";
import { ApiError } from "../utils/index.js";

// File size limit (10MB)
const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = ['application/pdf'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp/");
  },

  filename: function (req, file, cb) {
    file.originalname = file.originalname.replace(".pdf", `${Date.now()}.pdf`);
    cb(null,file.originalname);
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(new ApiError(400, "Only PDF files are allowed"), false);
    return;
  }
  cb(null, true);
};

// Create multer upload instance with restrictions
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Maximum 1 file per request
  }
});

// Middleware to check user's file count
const checkUserFileCount = async (req, res, next) => {
  try {
    // Get user's file count from database
    const userFileCount = await Note.countDocuments({ owner: req.user._id });
    if (userFileCount >= 100) {
      throw new ApiError(400, "Maximum file limit (100) reached for your account");
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export {upload,checkUserFileCount}