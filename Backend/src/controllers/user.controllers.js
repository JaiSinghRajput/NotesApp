import { ApiError, ApiResponse, asyncHandler, options ,refreshAccessToken} from "../utils/index.js";
import { User } from "../models/index.js";

const   logoutUser = asyncHandler(async (req, res) => {
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
    const { name, username, email } = req.body;
    if (!name&&!username&&!email) {
        throw new ApiError(400, "at least one field is required");
    }
    const updateFields = {};
    if (name) updateFields.name = name;
    if (username) updateFields.username = username.toLowerCase();
    if (email) updateFields.email = email.toLowerCase();
   const user =  await User.findByIdAndUpdate(req.user._id,
    {$set:updateFields}
     ,{new:true})
     .select("-password -refreshToken");
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
    logoutUser,
    refreshAccessToken,
    resetPassword,
    currentUser,
    updateProfile,
    makeAdmin,
    deleteAccount,
    allUsers
};