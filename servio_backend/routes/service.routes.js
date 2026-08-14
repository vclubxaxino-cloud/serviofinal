import { Router } from "express";
import {
  getCategories, getServices, getServiceById,
  createService, updateService, toggleServiceActive,
} from "../controllers/service.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Public — anyone can browse the catalog
router.get("/categories", getCategories);
router.get("/", getServices);
router.get("/:id", getServiceById);

// Admin only — catalog management
router.post("/", protect, requireRole("admin"), createService);
router.patch("/:id", protect, requireRole("admin"), updateService);
router.patch("/:id/toggle", protect, requireRole("admin"), toggleServiceActive);

export default router;
