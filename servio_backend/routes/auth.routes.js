import { Router } from "express";
import { register, login, logout, me, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { kycUpload } from "../middleware/upload.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// Safe for both signup flows: if the request isn't multipart/form-data
// (e.g. plain JSON user signup), multer just passes through untouched.
const kycFiles = kycUpload.fields([
  { name: "aadhaarFile", maxCount: 1 },
  { name: "kycFile", maxCount: 1 },
]);

router.post("/register/:role", authLimiter, kycFiles, register);   // /api/auth/register/user or /worker
router.post("/login/:role", authLimiter, login);         // /api/auth/login/user | /worker | /admin
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/forgot-password/:role", authLimiter, forgotPassword);
router.post("/reset-password/:role/:token", authLimiter, resetPassword);

export default router;
