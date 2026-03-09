import { ApiError, asyncHandler } from "../utils/index.js";
import jwt from "jsonwebtoken"
import { User } from "../models/index.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        console.log(`[Auth] verifyJWT checking route: ${req.originalUrl}`);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "no user logged in currently")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})
const checkPermissionToMakeAdmin = async (req, res, next) => {
    const user = await User.findById(req.user._id);

    try {
        if (user.role == "user") {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
        else if (user.role == "admin") {
            throw new ApiError(403, "You can upload notes but can not make new admins");
        }
        else if (user.role == "super-admin") {
            next();
        }
        else {
            throw new ApiError(403, "Invalid role")
        }
    } catch (error) {
        next(error)
    }
}
const checkPermissionToUpload = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Only admins can upload notes");
        }
        next();
    } catch (error) {
        next(error)
    }
}

const checkAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "super-admin") {
            throw new ApiError(403, "Admin access required");
        }
        next();
    } catch (error) {
        next(error)
    }
}

const checkSuperAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== "super-admin") {
            throw new ApiError(403, "Super Admin access required");
        }
        next();
    } catch (error) {
        next(error)
    }
}

export {
    verifyJWT,
    checkPermissionToMakeAdmin,
    checkPermissionToUpload,
    checkAdmin,
    checkSuperAdmin
};