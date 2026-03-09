import { Router } from "express";
import { getAllNotes, getUserNotes, getPlatformStats } from "../controllers/index.js";
import { verifyJWT, checkSuperAdmin } from "../middlewares/auth.middlewares.js";

const router = Router();
router.route("/").get(getAllNotes);
router.get("/user-notes", verifyJWT, getUserNotes);
router.get("/platform-stats", verifyJWT, checkSuperAdmin, getPlatformStats);

export default router;
