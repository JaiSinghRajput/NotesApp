import { Router } from "express";
import {
    handleUpload,
    handleDelete,
    getNoteFileUrl,
    searchNotes,
} from "../controllers/notes.controllers.js";
import { checkPermissionToUpload } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

// ✅ Upload a note (POST)
router.post("/upload", checkPermissionToUpload, upload.single("pdfFile"), handleUpload);

// ✅ Delete a note (DELETE)
router.delete("/:id", handleDelete);

// ✅ Get note file URL (GET)
router.get("/file/:id", getNoteFileUrl); // 🔄 Changed `_id` to `id` for consistency

// ✅ Search notes (GET)
router.get("/search", searchNotes);

export default router;
