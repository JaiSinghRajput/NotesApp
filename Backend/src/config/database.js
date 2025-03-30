import mongoose from "mongoose";
import {asyncHandler} from "../utils/asyncHandler.js";

const connectDB = asyncHandler(async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    try {
        // Remove any trailing slash from the URI
        const cleanUri = uri.endsWith('/') ? uri.slice(0, -1) : uri;
        
        // Connect to MongoDB with the database name in the URI
        await mongoose.connect(cleanUri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error; // Re-throw the error to be handled by the error handler
    }
}); 

export default connectDB;
