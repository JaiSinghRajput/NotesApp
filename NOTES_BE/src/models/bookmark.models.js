import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        required: true
    }
}, { timestamps: true });

// Ensure unique bookmark per user per note
BookmarkSchema.index({ user: 1, note: 1 }, { unique: true });

export const Bookmark = mongoose.model("Bookmark", BookmarkSchema);
