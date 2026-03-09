import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String
    }
}, { timestamps: true });

// User can rate a note only once
RatingSchema.index({ user: 1, note: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", RatingSchema);
