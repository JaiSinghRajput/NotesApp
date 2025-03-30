import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required : true
    },
    tags: [{ type: String }],
}, { timestamps: true });

// Full-text search index
NoteSchema.index({ title: "text", description: "text", category: "text" });

export const Note = mongoose.model("Note", NoteSchema);
