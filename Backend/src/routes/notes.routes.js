import { Router } from "express";
import {
    handleUpload,
    handleDelete,
    getNoteFileUrl,
    searchNotes,
} from "../controllers/index.js";
import { upload, checkUserFileCount,checkPermissionToUpload } from "../middlewares/index.js";

const router = Router();

// ✅ Upload a note (POST)
router.route("/upload").post(
    checkPermissionToUpload,
    checkUserFileCount,
    upload.single("pdfFile"),
    handleUpload
);

// ✅ Delete a note (DELETE)
router.route("/:id").delete(handleDelete);

// ✅ Get note file URL (GET)
router.route("/file/:id").get(getNoteFileUrl); 

// ✅ Search notes (GET)
router.route("/search").get(searchNotes);

export default router;
