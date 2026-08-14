import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// KYC documents are uploaded straight to Cloudinary — no local disk writes.
// This survives redeploys on Render/Railway (unlike local disk storage,
// which gets wiped every time those platforms restart the filesystem).
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "servio/kyc",
    resource_type: file.mimetype === "application/pdf" ? "raw" : "image",
    // Random-ish public_id so filenames aren't guessable
    public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  }),
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPG, PNG, WEBP, or PDF files are allowed."));
};

export const kycUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});
