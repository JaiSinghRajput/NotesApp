import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
}
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
        console.log(isUserExists);
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken; 
    if (!incomingrefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }
try {
    const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET);
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
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {$unset:{refreshToken:1}},
        {new:true})
        return res.status(200)
        .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }
    if(oldPassword === newPassword) {
        throw new ApiError(400, "Old password and new password cannot be the same");
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
})
const currentUser = asyncHandler(async (req,res)=>{
    if(!req.user) throw new ApiError(400,"no user logged in currently")
    else return res.json(new ApiResponse(200,"User fetched sucessfully",req.user))
})
const updateProfile = asyncHandler(async (req, res) => {
    const { name, username, email,password } = req.body;
    if (name||username||email) {
        throw new ApiError(400, "at least one field is required");
    }
   const user =  User.findByIdAndUpdate(req.user._id,{
        $set:{name,
            username:username.toLowerCase()
            ,email:email.toLowerCase()}
    },{new:true}).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});
const makeAdmin = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
   try {
     const newUserToAdmin = await User.findOne({ email: email.toLowerCase().trim() });
     if (!newUserToAdmin)   throw new ApiError(404, "User does not exist");
     if(newUserToAdmin.role!="user") throw new ApiError(400,"User is already an admin or super admin");
     newUserToAdmin.role = "admin";
     await newUserToAdmin.save();
     return res.status(200).json(new ApiResponse(200,"User role updated successfully",newUserToAdmin));
   } catch (error) {
       throw new ApiError(400,error?.message||"unable to update user role")
   }
});
const deleteAccount = asyncHandler(async (req, res) => {
try {
        await User.findOneAndDelete(req.user._id)
        return res.status(200).json(new ApiResponse(200, null, "Account deleted successfully"));
} catch (error) {
  throw new ApiError(400,"unable to delete account")  
}
});
//for development environment only
const allUsers = asyncHandler(async (req, res) => {
    const users = await User.find();
    return res.status(200).json(new ApiResponse(200,"All users fetched successfully",users));
});
export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    resetPassword,
    currentUser,
    updateProfile,
    makeAdmin,
    deleteAccount,
    allUsers
};