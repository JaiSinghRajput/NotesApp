import { Router } from "express";
import {
    logoutUser,
    refreshAccessToken,
    resetPassword,
    currentUser,
    updateProfile,
    makeAdmin,
    deleteAccount,
    demoteAdmin,
    allUsers,
    registerUser,
    loginUser
} from "../controllers/index.js";
import { verifyJWT, checkPermissionToMakeAdmin } from "../middlewares/auth.middlewares.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-access").post(refreshAccessToken);

// Secured routes
router.use(verifyJWT);

router.route("/all-users").get(checkPermissionToMakeAdmin, allUsers);
router.route("/logout").post(logoutUser);
router.route("/reset-password").put(resetPassword);
router.route("/account").get(currentUser);
router.route("/update-profile").put(updateProfile);
router.route("/make-admin").post(checkPermissionToMakeAdmin, makeAdmin);
router.route("/demote-admin").post(checkPermissionToMakeAdmin, demoteAdmin);
router.route("/delete-account").delete(deleteAccount);

export default router;
