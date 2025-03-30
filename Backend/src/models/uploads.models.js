import mongoose from "mongoose";
const UploadLogSchema = new mongoose.Schema({
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true },
  note: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Note", 
    required: true },
}, { timestamps: true });

export const UploadLog = mongoose.model("UploadLog", UploadLogSchema);
