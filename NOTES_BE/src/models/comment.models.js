import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Comment = mongoose.model("Comment", CommentSchema);
