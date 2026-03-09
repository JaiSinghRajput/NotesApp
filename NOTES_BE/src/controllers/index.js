import {
    registerUser,
    loginUser,
    generateAccessAndRefreshTokens
} from "./auth.controllers.js";
import { healthCheck } from "./healthCheck.controllers.js";
import {
    handleUpload,
    handleDelete,
    searchNotes,
    getNoteById,
} from "./notes.controllers.js";
import {
    getAllNotes,
    getUserNotes,
    getPlatformStats
} from "./uploads.controllers.js";
import {
    logoutUser,
    refreshAccessToken,
    resetPassword,
    currentUser,
    updateProfile,
    makeAdmin,
    demoteAdmin,
    deleteAccount,
    allUsers
} from "./user.controllers.js";
import {
    toggleBookmark,
    getMyBookmarks,
    addComment,
    getNoteComments,
    rateNote,
    getTrendingNotes,
    incrementViewCount,
    incrementDownloadCount
} from "./extra.controllers.js";
import {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "./category.controllers.js";

export {
    registerUser,
    loginUser,
    generateAccessAndRefreshTokens,
    healthCheck,
    handleUpload,
    handleDelete,
    searchNotes,
    getNoteById,
    getAllNotes,
    getUserNotes,
    getPlatformStats,
    logoutUser,
    refreshAccessToken,
    resetPassword,
    currentUser,
    updateProfile,
    makeAdmin,
    demoteAdmin,
    deleteAccount,
    allUsers,
    toggleBookmark,
    getMyBookmarks,
    addComment,
    getNoteComments,
    rateNote,
    getTrendingNotes,
    incrementViewCount,
    incrementDownloadCount,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
}