import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./apiError.js";
import dotenv from "dotenv";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (pdfPath)=> {
  if(!pdfPath) return null;
  try {
    const result = await cloudinary.uploader.upload(pdfPath, {
      resource_type: "raw", 
      folder: "notes", 
    });
    console.log(`CLOUDINARY RESPONSE ON UPLOAD --- `,result);
    return result;
  } catch (error) {
    throw new ApiError(500, error.message);
  }
}
const deleteFromCloudinary = async (publicId) => {
  try {
    const response =  await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw", 
      folder: "notes", 
    });
    console.log(`CLOUDINARY RESPONSE ON DELETE --- `,response);
    return response;
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};
export { uploadOnCloudinary,deleteFromCloudinary };
