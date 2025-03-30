import { Router } from "express";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    resetPassword,
    currentUser,
    updateProfile,
    makeAdmin,
    deleteAccount,
    allUsers} from "../controllers/user.controllers.js";
import {verifyJWT,checkPermissionToMakeAdmin} from "../middlewares/auth.middlewares.js"
const router = Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/all").get(allUsers);
//secure routes
router.route("/refresh-access").post(verifyJWT,refreshAccessToken);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/reset-password").put(verifyJWT,resetPassword);
router.route("/account").get(verifyJWT,currentUser);
router.route("/update-profile").put(verifyJWT,updateProfile);
router.route("/make-admin").post(verifyJWT,checkPermissionToMakeAdmin,makeAdmin);
router.route("/delete-account").delete(verifyJWT,deleteAccount);
export default router;
