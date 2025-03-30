import { Router } from "express";
import {
    logoutUser,
    refreshAccessToken,
    resetPassword,
    currentUser,
    updateProfile,
    makeAdmin,
    deleteAccount,
    allUsers} from "../controllers/user.controllers.js";
import {checkPermissionToMakeAdmin} from "../middlewares/auth.middlewares.js"
const router = Router();
router.route("/all").get(allUsers);
router.route("/logout").post(logoutUser);
router.route("/refresh-access").post(refreshAccessToken);
router.route("/reset-password").put(resetPassword);
router.route("/account").get(currentUser);
router.route("/update-profile").put(updateProfile);
router.route("/make-admin").post(checkPermissionToMakeAdmin,makeAdmin);
router.route("/delete-account").delete(deleteAccount);
export default router;
