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
router.route("/upload").post(checkPermissionToUpload, upload.single("pdfFile"), handleUpload);

// ✅ Delete a note (DELETE)
router.route("/:id").delete(handleDelete);

// ✅ Get note file URL (GET)
router.route("/file/:id").get(getNoteFileUrl); 

// ✅ Search notes (GET)
router.route("/search").get(searchNotes);

export default router;
