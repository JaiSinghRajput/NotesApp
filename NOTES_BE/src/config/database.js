import mongoose from "mongoose";
import { asyncHandler } from "../utils/index.js";

const connectDB = asyncHandler(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error; // Re-throw the error to be handled by the error handler
    }
});

export default connectDB;
