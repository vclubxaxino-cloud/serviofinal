import Worker from "../models/Worker.js";
import { sendWorkerApprovedEmail, sendWorkerRejectedEmail } from "../utils/mailer.js";
import { distanceBetweenPincodesKm } from "../utils/geo.js";

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

  // Real km-based matching (see utils/geo.js) — a worker matches if ANY of
  // their service-area pincodes is within ~20km of the customer's pincode,
  // using actual geographic distance (works for any Indian pincode) rather
  // than comparing pincode numbers.
  const withDistance = await Promise.all(
    candidates.map(async (w) => {
      const distances = (
        await Promise.all(w.serviceAreas.map((area) => distanceBetweenPincodesKm(pincode, area)))
      ).filter((d) => d !== null);

      if (distances.length === 0) {
        // None of this worker's service-area pincodes could be resolved
        // (external lookup failed/unavailable) — fall back to the legacy
        // same/near-number check so a lookup failure never silently drops
        // every worker from results.
        const inRangeLegacy = w.serviceAreas.some(
          (area) => area === pincode || Math.abs(parseInt(area, 10) - parseInt(pincode, 10)) < 20
        );
        return inRangeLegacy ? { worker: w, distanceKm: null } : null;
      }

      const closest = Math.min(...distances);
      return closest <= 20 ? { worker: w, distanceKm: closest } : null;
    })
  );

  const nearby = withDistance
    .filter(Boolean)
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
    .map(({ worker, distanceKm }) => {
      const obj = worker.toObject();
      obj.distanceKm = distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null;
      return obj;
    });

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

// ── Worker: toggle online/offline availability ──────────────────────────────
// PATCH /api/workers/me/status  { isOnline: true|false }
export const updateOnlineStatus = async (req, res) => {
  const { isOnline } = req.body;
  if (typeof isOnline !== "boolean") {
    return res.status(400).json({ message: "isOnline must be true or false." });
  }

  const worker = await Worker.findById(req.actor.id);
  if (!worker) return res.status(404).json({ message: "Worker not found." });

  if (isOnline && worker.kycStatus !== "approved") {
    return res.status(403).json({ message: "You can go online only after KYC is approved." });
  }

  worker.isOnline = isOnline;
  worker.lastOnlineAt = new Date();
  await worker.save();

  const safeWorker = worker.toObject();
  delete safeWorker.password;
  res.json({ worker: safeWorker });
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
  // Online workers first (so admin sees who can actually be reached right now),
  // then by rating within each group.
  const workers = await Worker.find(filter).select("-password").sort({ isOnline: -1, rating: -1 });
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