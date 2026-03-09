import {
    ApiError,
    ApiResponse,
    asyncHandler,
} from "../utils/index.js";
import { Note, Bookmark, Comment, Rating } from "../models/index.js";

// ================== TOGGLE BOOKMARK ==================
export const toggleBookmark = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user._id;

    const existingBookmark = await Bookmark.findOne({ user: userId, note: noteId });

    if (existingBookmark) {
        await Bookmark.findByIdAndDelete(existingBookmark._id);
        return res.status(200).json(new ApiResponse(200, { bookmarked: false }, "Bookmark removed"));
    }

    await Bookmark.create({ user: userId, note: noteId });
    return res.status(201).json(new ApiResponse(201, { bookmarked: true }, "Note bookmarked"));
});

// ================== GET MY BOOKMARKS ==================
export const getMyBookmarks = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const bookmarks = await Bookmark.find({ user: userId }).populate({
        path: 'note',
        populate: { path: 'uploadedBy', select: 'name email' }
    });

    const notes = bookmarks.map(b => b.note).filter(n => n !== null);
    return res.status(200).json(new ApiResponse(200, notes, "Bookmarks retrieved"));
});

// ================== ADD COMMENT ==================
export const addComment = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) throw new ApiError(400, "Comment content is required");

    const comment = await Comment.create({
        user: userId,
        note: noteId,
        content
    });

    const populatedComment = await comment.populate('user', 'name username');

    return res.status(201).json(new ApiResponse(201, populatedComment, "Comment added"));
});

// ================== GET COMMENTS ==================
export const getNoteComments = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const comments = await Comment.find({ note: noteId })
        .populate('user', 'name username')
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, comments, "Comments retrieved"));
});

// ================== ADD/UPDATE RATING ==================
export const rateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) throw new ApiError(400, "Invalid rating (1-5)");

    const updatedRating = await Rating.findOneAndUpdate(
        { user: userId, note: noteId },
        { rating, review },
        { upsate: true, new: true, upsert: true }
    );

    return res.status(200).json(new ApiResponse(200, updatedRating, "Rating updated"));
});

// ================== GET TRENDING NOTES ==================
export const getTrendingNotes = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    // Simple trending logic: sort by viewCount + downloadCount
    const notes = await Note.find()
        .sort({ viewCount: -1, downloadCount: -1 })
        .limit(limit)
        .populate('uploadedBy', 'name email');

    return res.status(200).json(new ApiResponse(200, notes, "Trending notes retrieved"));
});

// ================== UPDATE COUNTS ==================
export const incrementViewCount = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(noteId, { $inc: { viewCount: 1 } }, { new: true });
    return res.status(200).json(new ApiResponse(200, note, "View count incremented"));
});

export const incrementDownloadCount = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(noteId, { $inc: { downloadCount: 1 } }, { new: true });
    return res.status(200).json(new ApiResponse(200, note, "Download count incremented"));
});
