import { Router } from "express";
import {
    handleUpload,
    handleDelete,
    getAllCategories,
    searchNotes,
    getNoteById,
    getAllNotes,
    getUserNotes,
    getTrendingNotes,
    toggleBookmark,
    getMyBookmarks,
    addComment,
    getNoteComments,
    rateNote,
    incrementViewCount,
    incrementDownloadCount
} from "../controllers/index.js";
import { upload, checkUserFileCount, checkPermissionToUpload, verifyJWT } from "../middlewares/index.js";

const router = Router();

// Public routes
router.route("/").get(getAllNotes);
router.route("/categories").get(getAllCategories);
router.route("/search").get(searchNotes);
router.route("/trending").get(getTrendingNotes);
router.route("/:id").get(getNoteById);
router.route("/comments/:noteId").get(getNoteComments);

// Secured routes
router.use(verifyJWT);

router.route("/upload").post(
    checkPermissionToUpload,
    checkUserFileCount,
    upload.single("pdfFile"),
    handleUpload
);

router.route("/:id").delete(handleDelete);

// Extra features
router.route("/user-notes").get(getUserNotes);
router.route("/bookmark/:noteId").post(toggleBookmark);
router.route("/bookmarks").get(getMyBookmarks);
router.route("/comment/:noteId").post(addComment);
router.route("/rate/:noteId").post(rateNote);
router.route("/view/:noteId").patch(incrementViewCount);
router.route("/download/:noteId").patch(incrementDownloadCount);

export default router;
