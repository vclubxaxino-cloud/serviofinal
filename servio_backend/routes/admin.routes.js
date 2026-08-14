import { Router } from "express";
import { getStats, getUsers } from "../controllers/admin.controller.js";
import { protect, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", protect, requireRole("admin"), getStats);
router.get("/users", protect, requireRole("admin"), getUsers);

export default router;
