import { Router } from "express";
import {
  getAddresses, addAddress, updateAddress, deleteAddress,
  getNotificationPrefs, updateNotificationPrefs,
} from "../controllers/user.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, requireRole("user"));

router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.patch("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

router.get("/notification-prefs", getNotificationPrefs);
router.patch("/notification-prefs", updateNotificationPrefs);

export default router;
