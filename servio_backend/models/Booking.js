import mongoose from "mongoose";

// Status flow: pending_admin -> assigned -> in_progress -> awaiting_payment -> completed
//              pending_admin -> rejected (admin rejects / worker unavailable)
//
// Payment is strictly UPI-only — workers never accept cash. A job cannot
// reach "completed" until the customer submits a valid UPI transaction
// reference; "awaiting_payment" is the worker saying "work is done", not
// a confirmation that money changed hands.
const BOOKING_STATUS = ["pending_admin", "assigned", "in_progress", "awaiting_payment", "completed", "rejected"];

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    // Snapshot fields so booking history stays correct even if the service is edited later
    serviceTitle: { type: String, required: true },

    package: {
      label: { type: String, required: true },
      price: { type: Number, required: true },
    },

    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },       // set by admin on approval
    workerName: { type: String },                                          // snapshot, set on approval

    date: { type: String },   // "YYYY-MM-DD" — kept as string to match frontend <input type="date">
    time: { type: String },   // "HH:MM AM/PM" or 24h — kept as string to match <input type="time">
    address: { type: String, required: true },
    note: { type: String, default: "" },

    status: { type: String, enum: BOOKING_STATUS, default: "pending_admin" },

    // Strict UPI-only payment tracking. `workDoneAt` is set when the worker
    // marks the physical job finished; the booking sits in "awaiting_payment"
    // until the customer submits `upiRef` (their UPI transaction reference —
    // required, not optional, since cash is not accepted on this platform).
    payment: {
      workDoneAt: { type: Date },
      upiRef: { type: String, trim: true },       // customer-submitted proof of payment
      confirmedAt: { type: Date },                 // when the booking moved to "completed"
      confirmedBy: { type: String, enum: ["customer", "admin"] },
    },

    payout: { type: Number }, // amount owed to worker for this job
  },
  { timestamps: true }
);

export const BOOKING_STATUSES = BOOKING_STATUS;
export default mongoose.model("Booking", bookingSchema);
