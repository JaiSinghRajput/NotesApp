import { Router } from "express";
import { getAllNotes, getUserNotes } from "../controllers/uploads.controllers.js";

const router = Router();
router.route("/").get(getAllNotes);
router.get("/user/", getUserNotes);
export default router;
