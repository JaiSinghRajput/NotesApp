import {healthCheck} from "../controllers/index.js";
import { Router } from "express";

const router = Router();
router.route("/").get(healthCheck);