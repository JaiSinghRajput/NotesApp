import { Router } from "express";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/index.js";
import { verifyJWT, checkAdmin } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public routes
router.route("/").get(getAllCategories);

// Admin routes (as per prompt, admins manage categories)
router.route("/").post(verifyJWT, checkAdmin, createCategory);
router.route("/:id").patch(verifyJWT, checkAdmin, updateCategory);
router.route("/:id").delete(verifyJWT, checkAdmin, deleteCategory);

export default router;
