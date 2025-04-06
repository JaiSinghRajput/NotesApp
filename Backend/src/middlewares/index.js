import {verifyJWT,
    checkPermissionToMakeAdmin,
    checkPermissionToUpload} from "./auth.middlewares.js";
import {handleError} from "./error.middlewares.js";
import {apiLimiter, authLimiter} from "./rateLimit.middlewares.js";
import {upload,checkUserFileCount} from "./multer.middlewares.js";

export {verifyJWT,
    checkPermissionToMakeAdmin,
    checkPermissionToUpload,
    handleError,
    apiLimiter,
    authLimiter,
    upload,
    checkUserFileCount
}