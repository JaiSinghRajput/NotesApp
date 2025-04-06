import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"; // ✅ Add CORS support
import {authRoutes,notesRoutes,uploadsLogsRoutes,usersRoutes} from "./routes/index.routes.js"
import { handleError,apiLimiter, authLimiter,verifyJWT  } from "./middlewares/index.js";

const app = express();

// ✅ Middleware Setup
app.use(cors()); // Allow cross-origin requests
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use("/api/v1/", apiLimiter); // General API rate limiting
app.use("/api/v1/auth", authLimiter); // Stricter rate limiting for auth routes

// ✅ Route Definitions
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users",verifyJWT,usersRoutes);
app.use("/api/v1/uploads", verifyJWT, uploadsLogsRoutes); 
app.use("/api/v1/notes", verifyJWT,notesRoutes);

// ✅ Error Handling
app.use(handleError);

export default app;
