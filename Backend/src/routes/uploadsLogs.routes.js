import { Router } from "express";

const router = Router();
router.get("/", (req, res) => {
    res.send("all uploads logs");
});
router.get("/:id", (req, res) => {
    res.send(`upload log ${req.params.id}`);
});
export default router;
