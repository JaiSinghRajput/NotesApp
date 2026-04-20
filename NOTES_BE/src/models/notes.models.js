import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    filePublicId: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    pdfSha256: {
        type: String,
        trim: true,
        lowercase: true
    },
    pdfSimhash: {
        type: String,
        trim: true,
        lowercase: true
    },
    pdfTextSampleLength: {
        type: Number,
        default: 0
    },
    duplicateCheckMeta: {
        method: { type: String, default: "none" },
        score: { type: Number, default: 0 }
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    course: {
        type: String,
        required: true,
        trim: true
    },
    branch: {
        type: String,
        required: true,
        trim: true
    },
    semester: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true,
        trim: true
    },
    tags: [{ type: String }],
    downloadCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

// Full-text search index
NoteSchema.index({ title: "text", description: "text", course: "text", branch: "text", semester: "text", category: "text", unit: "text" });
NoteSchema.index({ pdfSha256: 1 }, { unique: true, sparse: true });
NoteSchema.index({ pdfSimhash: 1 });

export const Note = mongoose.model("Note", NoteSchema);
