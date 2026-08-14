import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Worker from "../models/Worker.js";
import User from "../models/User.js";
import {
  sendBookingSubmittedEmail,
  sendBookingAssignedEmail,
  sendBookingRejectedEmail,
  sendWorkDoneAwaitingPaymentEmail,
  sendBookingCompletedEmail,
} from "../utils/mailer.js";

const PAYOUT_RATE = 0.8; // worker's share of the package price

// ── User: create a booking (Step 3 → Confirm in the frontend flow) ─────────
export const createBooking = async (req, res) => {
  const { serviceId, packageId, date, time, address, note } = req.body;

  try {
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found." });

    const pkg = service.packages.find((p) => p.id === packageId);
    if (!pkg) return res.status(400).json({ message: "Selected package is not valid for this service." });

    if (!address || !address.trim()) {
      return res.status(400).json({ message: "Service address is required." });
    }

    const booking = await Booking.create({
      user: req.actor.id,
      service: service._id,
      serviceTitle: service.title,
      package: { label: pkg.label, price: pkg.price },
      date, time, address, note,
      status: "pending_admin",
    });

    res.status(201).json({ booking });

    // Fire-and-forget — a slow/failed email should never delay the API response.
    User.findById(req.actor.id).then((user) => {
      if (user) sendBookingSubmittedEmail(user, booking);
    });
  } catch (err) {
    res.status(500).json({ message: "Could not create booking. Please try again." });
  }
};

// ── User: my bookings (Bookings.jsx) ────────────────────────────────────────
export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.actor.id }).sort({ createdAt: -1 });
  res.json({ bookings });
};

// ── User: get the platform's UPI details, for the payment QR screen ────────
// Static/global for now (one Servio UPI ID) — set via env so it can be
// changed without a code deploy.
export const getUpiInfo = (req, res) => {
  res.json({
    upiId: process.env.ADMIN_UPI_ID || "servio.payments@upi",
    payeeName: process.env.ADMIN_UPI_PAYEE_NAME || "Servio",
  });
};

// ── Admin: full queue / pending queue ───────────────────────────────────────
export const getAdminBookings = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const bookings = await Booking.find(filter)
    .populate("user", "name phone")
    .populate("worker", "name")
    .populate({ path: "service", populate: { path: "category", select: "name" } })
    .sort({ createdAt: -1 });
  res.json({ bookings });
};

// Admin picks a worker and approves in one step — customers never choose
// their own partner, per the updated booking flow.
export const approveBooking = async (req, res) => {
  const { workerId } = req.body;
  if (!workerId) return res.status(400).json({ message: "Please select a partner to assign." });

  const worker = await Worker.findById(workerId);
  if (!worker || worker.kycStatus !== "approved") {
    return res.status(400).json({ message: "Selected partner is not available." });
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "assigned", worker: worker._id, workerName: worker.name },
    { new: true }
  );
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  res.json({ booking });

  User.findById(booking.user).then((user) => {
    if (user) sendBookingAssignedEmail(user, booking);
  });
};

export const rejectBooking = async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  res.json({ booking });

  User.findById(booking.user).then((user) => {
    if (user) sendBookingRejectedEmail(user, booking);
  });
};

// ── Worker: my jobs ──────────────────────────────────────────────────────────
export const getWorkerJobs = async (req, res) => {
  const jobs = await Booking.find({
    worker: req.actor.id,
    status: { $in: ["assigned", "in_progress", "awaiting_payment", "completed"] },
  })
    .populate("user", "name phone")
    .sort({ createdAt: -1 });
  res.json({ jobs });
};

export const getWorkerJobById = async (req, res) => {
  const job = await Booking.findOne({ _id: req.params.id, worker: req.actor.id }).populate("user", "name phone");
  if (!job) return res.status(404).json({ message: "Job not found." });
  res.json({ job });
};

// Worker marks the physical work as finished. This does NOT complete the
// booking or calculate a payout — Servio is strictly UPI-only, so the job
// only becomes "completed" once the customer submits a UPI reference as
// proof of payment (see confirmPayment below). Workers cannot accept or
// record cash anywhere in this flow.
export const markWorkDone = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, worker: req.actor.id });
  if (!booking) return res.status(404).json({ message: "Job not found." });
  if (booking.status !== "assigned" && booking.status !== "in_progress") {
    return res.status(400).json({ message: "This job cannot be marked done from its current state." });
  }

  booking.status = "awaiting_payment";
  booking.payment.workDoneAt = new Date();
  await booking.save();

  res.json({ booking });

  User.findById(booking.user).then((user) => {
    if (user) sendWorkDoneAwaitingPaymentEmail(user, booking);
  });
};

// ── User: confirm payment with a UPI transaction reference ─────────────────
// This is the strict verification step — a booking cannot reach "completed"
// without a UPI reference on file. No cash option exists anywhere in this flow.
export const confirmPayment = async (req, res) => {
  const { upiRef } = req.body;
  const cleaned = (upiRef || "").trim();

  if (!cleaned || cleaned.length < 6) {
    return res.status(400).json({ message: "Please enter a valid UPI transaction reference number." });
  }

  const booking = await Booking.findOne({ _id: req.params.id, user: req.actor.id });
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  if (booking.status !== "awaiting_payment") {
    return res.status(400).json({ message: "This booking isn't awaiting payment confirmation." });
  }

  // Reject a UPI reference that's already been used for another booking —
  // basic guard against re-submitting the same proof twice.
  const duplicate = await Booking.findOne({ "payment.upiRef": cleaned, _id: { $ne: booking._id } });
  if (duplicate) {
    return res.status(409).json({ message: "This UPI reference has already been used for another booking." });
  }

  booking.status = "completed";
  booking.payment.upiRef = cleaned;
  booking.payment.confirmedAt = new Date();
  booking.payment.confirmedBy = "customer";
  booking.payout = Math.round(booking.package.price * PAYOUT_RATE);
  await booking.save();

  if (booking.worker) {
    await Worker.findByIdAndUpdate(booking.worker, { $inc: { jobsDone: 1 } });
  }

  res.json({ booking });

  User.findById(booking.user).then((user) => {
    if (user) sendBookingCompletedEmail(user, booking);
  });
};

// ── Admin: fallback payment confirmation ────────────────────────────────────
// For disputes/edge cases where the customer can't submit via the app —
// still requires a UPI reference, so cash is never an accepted path even
// when admin steps in manually.
export const adminConfirmPayment = async (req, res) => {
  const { upiRef } = req.body;
  const cleaned = (upiRef || "").trim();

  if (!cleaned || cleaned.length < 6) {
    return res.status(400).json({ message: "A valid UPI transaction reference is required." });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  if (booking.status !== "awaiting_payment") {
    return res.status(400).json({ message: "This booking isn't awaiting payment confirmation." });
  }

  booking.status = "completed";
  booking.payment.upiRef = cleaned;
  booking.payment.confirmedAt = new Date();
  booking.payment.confirmedBy = "admin";
  booking.payout = Math.round(booking.package.price * PAYOUT_RATE);
  await booking.save();

  if (booking.worker) {
    await Worker.findByIdAndUpdate(booking.worker, { $inc: { jobsDone: 1 } });
  }

  res.json({ booking });

  User.findById(booking.user).then((user) => {
    if (user) sendBookingCompletedEmail(user, booking);
  });
};
