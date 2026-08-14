import { api } from "../api/client.js";

export const PENDING_BOOKING_KEY = "servio_pending_booking";

// After a guest logs in or signs up, if they had a booking in progress
// (saved by ServiceDetail.jsx before showing the login/signup gate),
// submit it now and send them to My Bookings. Returns true if a booking
// was submitted, so the caller can navigate accordingly.
export async function resumePendingBooking(role) {
  if (role !== "user") return false;

  const raw = sessionStorage.getItem(PENDING_BOOKING_KEY);
  if (!raw) return false;

  sessionStorage.removeItem(PENDING_BOOKING_KEY);

  try {
    const draft = JSON.parse(raw);
    await api.post("/bookings", {
      serviceId: draft.serviceId,
      packageId: draft.packageId,
      date: draft.date,
      time: draft.time,
      address: draft.address,
      note: draft.note,
    });
    return true;
  } catch {
    // If it fails (e.g. worker no longer available), just drop the draft —
    // the person can re-book from scratch. Not worth blocking login over.
    return false;
  }
}
