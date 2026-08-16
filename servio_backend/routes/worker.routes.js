import { Router } from "express";
import {
  getNearbyWorkers, getFeaturedWorkers, getWorkerProfile, getApprovedWorkers,
  updateServiceAreas, updateWorkerNotificationPrefs, updateOnlineStatus,
  getPendingWorkers, approveWorker, rejectWorker,
} from "../controllers/worker.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/featured", getFeaturedWorkers); // public
router.get("/nearby", getNearbyWorkers); // kept for backward-compat / other uses
router.get("/me", protect, requireRole("worker"), getWorkerProfile);
router.patch("/me/service-areas", protect, requireRole("worker"), updateServiceAreas);
router.patch("/me/status", protect, requireRole("worker"), updateOnlineStatus);
router.patch("/me/notification-prefs", protect, requireRole("worker"), updateWorkerNotificationPrefs);

// Admin — KYC review queue + assignment
router.get("/approved", protect, requireRole("admin"), getApprovedWorkers);
router.get("/pending", protect, requireRole("admin"), getPendingWorkers);
router.patch("/:id/approve", protect, requireRole("admin"), approveWorker);
router.patch("/:id/reject", protect, requireRole("admin"), rejectWorker);

export default router;
