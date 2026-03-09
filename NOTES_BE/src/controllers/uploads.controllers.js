import { Note, User } from "../models/index.js";
import { ApiResponse, ApiError, asyncHandler } from "../utils/index.js";

const getAllNotes = asyncHandler(async (req, res, next) => {
  try {
    // Parse query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category } = req.query;

    // Build filter dynamically
    const filter = {};
    if (category) {
      filter.category = category;
    }

    // Fetch paginated + filtered notes
    const notes = await Note.find(filter)
      .populate("uploadedBy", "name email") // show nice uploader info
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Total count for pagination
    const totalNotes = await Note.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          notes,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(totalNotes / limit),
            totalNotes,
          },
        },
        "Notes retrieved successfully"
      )
    );
  } catch (error) {
    next(error);
  }
});

const getUserNotes = asyncHandler(async (req, res) => {
  let userId;

  if (req.user?.role === "super-admin" && req.query.email) {
    // super-admin can query any user by email
    const user = await User.findOne({ email: req.query.email.toLowerCase().trim() });
    if (!user) throw new ApiError(404, "User not found");
    userId = user._id;
  } else if (req.user?.role === "admin" && req.query.email) {
    // admin can also query by email
    const user = await User.findOne({ email: req.query.email.toLowerCase().trim() });
    if (!user) throw new ApiError(404, "User not found");
    userId = user._id;
  } else {
    // fallback: normal user (or admin without email) → get own notes
    userId = req.user._id;
  }

  const notes = await Note.find({ uploadedBy: userId })
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, notes, "User's notes retrieved successfully"));
});

const getPlatformStats = asyncHandler(async (req, res) => {
  const totalNotes = await Note.countDocuments();
  const totalUsers = await User.countDocuments();

  // Stats by category
  const categoryStats = await Note.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);

  // Aggregate total downloads
  const downloadStats = await Note.aggregate([
    { $group: { _id: null, totalDownloads: { $sum: "$downloadCount" } } }
  ]);

  // Get 5 most recent uploads with uploader details
  const recentNotes = await Note.find()
    .select("title category createdAt uploadedBy")
    .populate("uploadedBy", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  const stats = {
    totalNotes,
    totalUsers,
    categoryStats,
    totalDownloads: downloadStats[0]?.totalDownloads || 0,
    recentNotes
  };

  return res.status(200).json(new ApiResponse(200, stats, "Platform stats retrieved successfully"));
});

export {
  getAllNotes,
  getUserNotes,
  getPlatformStats
};
