import express from "express";
import cookieParser from "cookie-parser";
import uploadsLogsRoutes from "./routes/uploadsLogs.routes.js";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import usersRoutes from "./routes/user.routes.js";
import { handleError } from "./middlewares/error.middlewares.js";
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/uploads", uploadsLogsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/users", usersRoutes);


app.use(handleError);
export default app;
