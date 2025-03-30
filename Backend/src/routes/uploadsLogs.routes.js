import { Router } from "express";
import { getAllNotes, getUserNotes } from "../controllers/notes.controllers.js";

const router = Router();
router.route("/").get(getAllNotes);

router.get("/user/:id", getUserNotes);
export default router;
