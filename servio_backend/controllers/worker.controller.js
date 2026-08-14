import Worker from "../models/Worker.js";
import { sendWorkerApprovedEmail, sendWorkerRejectedEmail } from "../utils/mailer.js";

// GET /api/workers/nearby?pincode=490001&skill=Video Services
// Used in the booking flow (Step 3: pick a partner near the customer)
export const getNearbyWorkers = async (req, res) => {
  const { pincode, skill } = req.query;
  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ message: "A valid 6-digit pincode is required." });
  }

  const filter = { kycStatus: "approved" };
  if (skill) filter.skills = skill;

  const candidates = await Worker.find(filter).select("-password");

  // Same "within ~20 of the pincode number" matching used on the frontend demo
  const nearby = candidates.filter((w) =>
    w.serviceAreas.some((area) => area === pincode || Math.abs(parseInt(area) - parseInt(pincode)) < 20)
  );

  res.json({ workers: nearby });
};

// GET /api/workers/featured — public, used on the Home page ("Top-rated partners")
export const getFeaturedWorkers = async (req, res) => {
  const workers = await Worker.find({ kycStatus: "approved" })
    .select("-password")
    .sort({ rating: -1, jobsDone: -1 })
    .limit(5);
  res.json({ workers });
};

export const getWorkerProfile = async (req, res) => {
  const worker = await Worker.findById(req.actor.id).select("-password");
  if (!worker) return res.status(404).json({ message: "Worker not found." });
  res.json({ worker });
};

// ── Worker: update their own service areas (pincodes they can travel to) ───
export const updateServiceAreas = async (req, res) => {
  const { serviceAreas } = req.body;
  const cleaned = Array.isArray(serviceAreas)
    ? serviceAreas
    : String(serviceAreas || "").split(",").map((s) => s.trim()).filter(Boolean);

  if (cleaned.length === 0) {
    return res.status(400).json({ message: "Please provide at least one pincode." });
  }
  if (cleaned.some((p) => !/^\d{6}$/.test(p))) {
    return res.status(400).json({ message: "Each pincode must be exactly 6 digits." });
  }

  const worker = await Worker.findByIdAndUpdate(
    req.actor.id,
    { serviceAreas: cleaned },
    { new: true }
  ).select("-password");
  res.json({ worker });
};

// ── Worker: notification preferences ────────────────────────────────────────
export const updateWorkerNotificationPrefs = async (req, res) => {
  const { jobAlerts, payoutUpdates } = req.body;
  const worker = await Worker.findByIdAndUpdate(
    req.actor.id,
    {
      notificationPrefs: {
        jobAlerts: jobAlerts !== undefined ? !!jobAlerts : true,
        payoutUpdates: payoutUpdates !== undefined ? !!payoutUpdates : true,
      },
    },
    { new: true }
  ).select("-password");
  res.json({ notificationPrefs: worker.notificationPrefs });
};

// ── Admin: all approved workers, for assigning to a booking ────────────────
// GET /api/workers/approved?skill=Video Services (skill filter optional)
export const getApprovedWorkers = async (req, res) => {
  const filter = { kycStatus: "approved" };
  if (req.query.skill) filter.skills = req.query.skill;
  const workers = await Worker.find(filter).select("-password").sort({ rating: -1 });
  res.json({ workers });
};

// ── Admin: KYC queue ─────────────────────────────────────────────────────────
export const getPendingWorkers = async (req, res) => {
  const workers = await Worker.find({ kycStatus: "pending" }).select("-password");
  res.json({ workers });
};

export const approveWorker = async (req, res) => {
  const worker = await Worker.findByIdAndUpdate(
    req.params.id,
    { kycStatus: "approved" },
    { new: true }
  ).select("-password");
  if (!worker) return res.status(404).json({ message: "Worker not found." });
  res.json({ worker });

  sendWorkerApprovedEmail(worker);
};

export const rejectWorker = async (req, res) => {
  const worker = await Worker.findByIdAndUpdate(
    req.params.id,
    { kycStatus: "rejected" },
    { new: true }
  ).select("-password");
  if (!worker) return res.status(404).json({ message: "Worker not found." });
  res.json({ worker });

  sendWorkerRejectedEmail(worker);
};
