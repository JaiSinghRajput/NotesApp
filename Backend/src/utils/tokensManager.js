import { User } from "../models/user.models.js";
import { ApiError } from "./apiError.js";
import { asyncHandler } from "./asyncHandler.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await
        User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error : something went wrong ");
    }
}
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken; 
    if (!incomingrefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }
try {
    const decodedToken = JsonWebTokenError.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id); 
    if(!user) {
        throw new ApiError(404, "invalid refresh token");
    }
    if (incomingrefreshToken!== user?.refreshToken) {
        throw new ApiError(401, "refresh token is expired or used");
    }
    const { accessToken,newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken:newRefreshToken }, "Access token refreshed successfully"));
} catch (error) {
    throw new ApiError(401, error?.message || "internal server error");
    
}

})


export { generateAccessAndRefreshTokens, refreshAccessToken };