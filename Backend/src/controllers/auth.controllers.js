import { ApiError, ApiResponse, asyncHandler ,generateAccessAndRefreshTokens} from "../utils/index.js";
import { User } from "../models/index.js";

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
}

const registerUser = asyncHandler(async (req, res) => {
    const {
        username,
        name,
        email,
        password
    } = req.body;

    // Validate required fields
    if ([name, email, password, username].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Clean and normalize email and username
    const normalizedEmail = email?.trim()?.toLowerCase();
    const normalizedUsername = username?.trim()?.toLowerCase();

    // Check if user already exists
    const isUserExists = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });
    if (isUserExists) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    // Create new user
    const user = await User.create({
        name,
        username: normalizedUsername,
        email: normalizedEmail,
        password
    });

    // Get user without sensitive information
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Error while creating user");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, {
            user: createdUser,
        }, "User Registered Successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
// validate password
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");
    return res
    .status(200)
    .header("Authorization", `Bearer ${accessToken}`)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken
    }, "User logged in successfully"));
});
export {
    registerUser,
    loginUser,
    generateAccessAndRefreshTokens
}