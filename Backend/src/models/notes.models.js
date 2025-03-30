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

        type: String
    },
    tags: [
        { type: String }
    ],
}, { timestamps: true });

export const Note = mongoose.model("Note", NoteSchema);
