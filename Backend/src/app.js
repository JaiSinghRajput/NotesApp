import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"; // ✅ Add CORS support
import uploadsLogsRoutes from "./routes/uploadsLogs.routes.js";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import usersRoutes from "./routes/user.routes.js";
import { handleError } from "./middlewares/error.middlewares.js";
import { verifyJWT } from "./middlewares/auth.middlewares.js";

const app = express();

// ✅ Middleware Setup
app.use(cors()); // Allow cross-origin requests
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Route Definitions
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users",verifyJWT,usersRoutes);
app.use("/api/v1/uploads", verifyJWT, uploadsLogsRoutes); 
app.use("/api/v1/notes", verifyJWT, notesRoutes);

// ✅ Error Handling
app.use(handleError);

export default app;
