// Booking status flow:
// pending_admin → assigned → in_progress → awaiting_payment → completed
// pending_admin → rejected (admin rejects)
//
// Servio is strictly UPI-only — a booking cannot skip "awaiting_payment"
// and go straight to "completed"; that transition only happens once the
// customer submits a verified UPI transaction reference.

export const BOOKING_STATUS = {
  PENDING_ADMIN:     "pending_admin",
  ASSIGNED:          "assigned",
  IN_PROGRESS:       "in_progress",
  AWAITING_PAYMENT:  "awaiting_payment",
  COMPLETED:         "completed",
  REJECTED:          "rejected",
};

export const STATUS_LABEL = {
  pending_admin:    "Awaiting Confirmation",
  assigned:         "Partner Assigned",
  in_progress:      "In Progress",
  awaiting_payment: "Awaiting Payment",
  completed:        "Completed",
  rejected:         "Not Available",
};

export const STATUS_COLOR = {
  pending_admin:    "warn",
  assigned:         "ok",
  in_progress:      "ok",
  awaiting_payment: "warn",
  completed:        "ink",
  rejected:         "danger",
};
