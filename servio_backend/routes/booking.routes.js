import { Router } from "express";
import {
  createBooking, getMyBookings, getUpiInfo, confirmPayment,
  getAdminBookings, approveBooking, rejectBooking, adminConfirmPayment,
  getWorkerJobs, getWorkerJobById, markWorkDone,
} from "../controllers/booking.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import { bookingLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// User
router.post("/", protect, requireRole("user"), bookingLimiter, createBooking);
router.get("/my", protect, requireRole("user"), getMyBookings);
router.get("/upi-info", protect, requireRole("user"), getUpiInfo);
router.patch("/:id/confirm-payment", protect, requireRole("user"), bookingLimiter, confirmPayment);

// Worker
router.get("/worker/jobs", protect, requireRole("worker"), getWorkerJobs);
router.get("/worker/jobs/:id", protect, requireRole("worker"), getWorkerJobById);
router.patch("/:id/work-done", protect, requireRole("worker"), markWorkDone);

// Admin
router.get("/admin", protect, requireRole("admin"), getAdminBookings);
router.patch("/:id/approve", protect, requireRole("admin"), approveBooking);
router.patch("/:id/reject", protect, requireRole("admin"), rejectBooking);
router.patch("/:id/admin-confirm-payment", protect, requireRole("admin"), adminConfirmPayment);

export default router;
