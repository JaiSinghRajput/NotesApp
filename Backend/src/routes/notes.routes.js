import { Router } from "express";
import {handleUpload} from "../controllers/index.js";
import {checkPermissionToUpload} from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
const router = Router();

router.route("/upload").post(
    checkPermissionToUpload,
    upload.single("pdfFile"),
    handleUpload
       )

router.get("/", (req, res) => {
    res.send("get notes");
});

router.get("/:id", (req, res) => {
    res.send("get note by id");
});

router.delete("/:id", (req, res) => {
    res.send("delete note");
});
//search notes
router.get("/search/:query", (req, res) => {
    res.send("search notes");
});
router.get("/search/:category", (req, res) => {
    res.send("search notes");
});


export default router;
