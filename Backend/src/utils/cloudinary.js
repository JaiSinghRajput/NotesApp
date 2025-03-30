import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (pdfPath)=> {
  if(!pdfPath) return
  try {
    const result = await cloudinary.uploader.upload(pdfPath, {
      resource_type: "raw", 
      folder: "notes", 
    });
    return result.secure_url;
  } catch (error) {
    return null;
  }
}

export { uploadOnCloudinary };
