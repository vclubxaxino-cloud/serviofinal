import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, HardHat, IndianRupee, ChevronRight, MapPin, Calendar, LogIn, AlertCircle, Ban } from "lucide-react";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { STATUS_LABEL } from "../../constants/bookingStatus.js";
import UpiQrCode from "../../components/shared/UpiQrCode.jsx";

export default function Bookings() {
  const navigate = useNavigate();
  const { role, ready } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [payingBooking, setPayingBooking] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const loadBookings = async () => {
    try {
      const { bookings: mine } = await api.get("/bookings/my");
      setBookings(mine);
    } catch (err) {
      setError(err.message || "Could not load your bookings right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    if (role !== "user") { setLoading(false); return; }
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, role]);

  const filtered = bookings.filter(b => {
    if (activeTab === "upcoming") return ["pending_admin", "assigned", "in_progress", "awaiting_payment"].includes(b.status);
    if (activeTab === "past") return ["completed", "rejected"].includes(b.status);
    return true;
  });

  if (!ready || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (role !== "user") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-4">
          <Calendar size={24} className="text-[var(--color-gold-deep)]" />
        </div>
        <h2 className="font-display font-bold text-[20px]">Log in to see your bookings</h2>
        <p className="text-black/40 text-[13.5px] mt-2 leading-relaxed max-w-xs">
          Create an account or log in to track your bookings and their live status here.
        </p>
        <button onClick={() => navigate("/login/user")}
          className="mt-6 flex items-center gap-2 bg-[var(--color-ink)] text-white font-semibold rounded-xl px-7 py-3.5 text-[14px] active:scale-95 transition-transform">
          <LogIn size={16} /> Log in
        </button>
        <button onClick={() => navigate("/signup/user")} className="mt-3 text-[13px] text-[var(--color-gold-deep)] font-semibold">
          New here? Create an account
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center">
        <p className="font-semibold text-[15px]">Couldn't load your bookings</p>
        <p className="text-black/40 text-[13px] mt-2">{error}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-black/4 flex items-center justify-center mb-4">
          <Calendar size={24} className="text-black/25" />
        </div>
        <h2 className="font-display font-bold text-[20px]">No bookings yet</h2>
        <p className="text-black/40 text-[13.5px] mt-2 leading-relaxed">Book your first service and it'll appear here with live status updates.</p>
        <button onClick={() => navigate("/user/services")}
          className="mt-6 bg-[var(--color-ink)] text-white font-semibold rounded-xl px-7 py-3.5 text-[14px] active:scale-95 transition-transform">
          Browse services
        </button>
      </div>
    );
  }

  return (
    <div className="pb-28 page-enter">
      <div className="px-5 pt-6">
        <h1 className="font-display text-[24px] font-bold">My Bookings</h1>
        <p className="text-black/40 text-[13px] mt-0.5">{bookings.length} total · {bookings.filter(b => b.status === "completed").length} completed</p>
        <div className="flex gap-2 mt-4">
          {[{ key: "all", label: "All" }, { key: "upcoming", label: "Upcoming" }, { key: "past", label: "Past" }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full text-[12.5px] font-semibold border transition-all ${activeTab === t.key ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]" : "bg-white text-black/50 border-black/10"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {filtered.length === 0 && <div className="text-center py-10 text-black/35 text-[13px]">No {activeTab} bookings.</div>}
        {filtered.map(b => {
          const expanded = expandedId === b._id;
          return (
            <div key={b._id} className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm">
              <div className={`h-1 w-full ${
                b.status === "completed" ? "bg-black/10"
                : b.status === "rejected" ? "bg-[var(--color-danger)]"
                : b.status === "awaiting_payment" ? "bg-amber-400"
                : b.status === "assigned" ? "bg-[var(--color-ok)]"
                : "bg-[var(--color-gold)]"
              }`} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14.5px] leading-tight">{b.serviceTitle}</p>
                    <p className="text-[12px] text-black/40 mt-0.5">{b.package?.label} · ₹{b.package?.price?.toLocaleString("en-IN")}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-[12px] text-black/50">
                    <HardHat size={13} className="shrink-0" />
                    <span>{b.workerName || "To be assigned"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-black/40">
                    <Clock size={12} className="shrink-0" />
                    <span>{b.date || "TBD"} {b.time ? `· ${b.time}` : ""}</span>
                  </div>
                </div>
                {b.address && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-black/40">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>
                )}
                {b.status === "pending_admin" && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <Clock size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-amber-700 leading-relaxed">Our team is reviewing your request — usually confirmed within a few hours.</p>
                  </div>
                )}
                {b.status === "assigned" && (
                  <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-emerald-700">Booking confirmed! <span className="font-semibold">{b.workerName}</span> will arrive on {b.date}.</p>
                  </div>
                )}
                {b.status === "awaiting_payment" && (
                  <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <IndianRupee size={13} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-amber-700 leading-relaxed">
                      Your partner marked this job done. Please pay <b>₹{b.package?.price?.toLocaleString("en-IN")}</b> via UPI to complete your booking.
                    </p>
                  </div>
                )}
                {b.status === "completed" && b.payment?.upiRef && (
                  <div className="mt-3 bg-black/3 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[var(--color-ok)] mt-0.5 shrink-0" />
                    <p className="text-[12px] text-black/50">Paid via UPI · Ref: {b.payment.upiRef}</p>
                  </div>
                )}
                {b.status === "rejected" && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <XCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-[12px] text-red-600">Partner unavailable for this slot. Please book again with a different time.</p>
                  </div>
                )}
                <div className="flex gap-2 mt-3">
                  {b.status === "awaiting_payment" && (
                    <button onClick={() => setPayingBooking(b)}
                      className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-2.5 text-[13px] active:scale-95 transition-transform">
                      <IndianRupee size={14} /> Pay via UPI
                    </button>
                  )}
                  {b.status === "rejected" && (
                    <button onClick={() => navigate("/user/services")}
                      className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-2.5 text-[13px] active:scale-95 transition-transform">
                      Book again
                    </button>
                  )}
                  <button onClick={() => setExpandedId(expanded ? null : b._id)}
                    className="flex items-center justify-center gap-1 border border-black/10 text-black/45 font-medium rounded-xl px-3 py-2.5 text-[12.5px] active:bg-black/3 transition-colors">
                    {expanded ? "Less" : "Details"} <ChevronRight size={13} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
                  </button>
                </div>
                {expanded && (
                  <div className="mt-3 pt-3 border-t border-black/5 space-y-2 page-enter">
                    <DetailRow label="Booking ID" value={`#SRV${b._id.toUpperCase().slice(-6)}`} />
                    <DetailRow label="Service" value={b.serviceTitle} />
                    <DetailRow label="Package" value={b.package?.label} />
                    <DetailRow label="Amount" value={`₹${b.package?.price?.toLocaleString("en-IN")}`} />
                    <DetailRow label="Partner" value={b.workerName || "TBD"} />
                    <DetailRow label="Scheduled" value={b.date ? `${b.date}${b.time ? " at " + b.time : ""}` : "Flexible"} />
                    <DetailRow label="Address" value={b.address || "—"} />
                    {b.payment?.upiRef && <DetailRow label="UPI reference" value={b.payment.upiRef} />}
                    <DetailRow label="Booked on" value={new Date(b.createdAt).toLocaleDateString("en-IN")} last />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 mt-5">
        <button onClick={() => navigate("/user/services")}
          className="w-full border-2 border-dashed border-black/10 rounded-2xl py-4 text-[13.5px] font-semibold text-black/35 flex items-center justify-center gap-2 active:bg-black/2 transition-colors">
          <span className="text-lg">+</span> Book another service
        </button>
      </div>

      {payingBooking && (
        <PaymentSheet
          booking={payingBooking}
          onClose={() => setPayingBooking(null)}
          onConfirmed={(updated) => {
            setBookings((list) => list.map((b) => (b._id === updated._id ? { ...b, ...updated } : b)));
            setPayingBooking(null);
          }}
        />
      )}
    </div>
  );
}

function PaymentSheet({ booking, onClose, onConfirmed }) {
  const [upiInfo, setUpiInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [upiRef, setUpiRef] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/bookings/upi-info")
      .then(setUpiInfo)
      .catch(() => setError("Couldn't load payment details. Please try again."))
      .finally(() => setLoadingInfo(false));
  }, []);

  const handleConfirm = async () => {
    const cleaned = upiRef.trim();
    if (!cleaned || cleaned.length < 6) {
      setError("Please enter the UPI transaction reference number from your payment app.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { booking: updated } = await api.patch(`/bookings/${booking._id}/confirm-payment`, { upiRef: cleaned });
      onConfirmed(updated);
    } catch (err) {
      setError(err.message || "Could not confirm your payment. Please check the reference and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
        <h2 className="font-display font-bold text-[20px] text-center">Pay for your service</h2>
        <p className="text-black/40 text-[13px] text-center mt-1 mb-5">{booking.serviceTitle} · {booking.package?.label}</p>

        <div className="flex items-center gap-2 justify-center bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-5">
          <Ban size={13} className="text-[var(--color-danger)] shrink-0" />
          <p className="text-[11.5px] text-red-700">Cash is not accepted — UPI payment only.</p>
        </div>

        {loadingInfo ? (
          <div className="flex justify-center py-10">
            <span className="w-6 h-6 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
          </div>
        ) : upiInfo ? (
          <>
            <div className="mx-auto w-fit border-2 border-[var(--color-ink)]/15 rounded-2xl p-3 bg-[var(--color-paper-dim)] mb-4">
              <UpiQrCode upiId={upiInfo.upiId} payeeName={upiInfo.payeeName} amount={booking.package?.price} note={booking.serviceTitle} />
            </div>
            {/* <p className="text-center text-[11px] text-black/40 font-mono mb-1">{upiInfo.upiId}</p> */}
            <div className="text-center mb-5">
              <p className="text-[12.5px] text-black/40">Amount to pay</p>
              <p className="font-display font-bold text-[30px] text-[var(--color-ink)] mt-0.5">₹{booking.package?.price?.toLocaleString("en-IN")}</p>
            </div>

            <label className="text-[12.5px] font-semibold text-black/55 block mb-1.5">
              UPI transaction reference / UTR number
            </label>
            <input
              value={upiRef}
              onChange={(e) => { setUpiRef(e.target.value); setError(""); }}
              placeholder="e.g. 234567891234"
              className={`w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] outline-none transition-colors ${
                error ? "border-[var(--color-danger)] bg-red-50" : "border-black/10 focus:border-[var(--color-gold)]"
              }`}
            />
            <p className="text-[11px] text-black/35 mt-1.5">
              Find this in your UPI app's payment history after paying — required to confirm your booking.
            </p>

            {error && (
              <div className="flex items-center gap-2 text-[var(--color-danger)] text-[12.5px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mt-3">
                <AlertCircle size={13} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 border border-black/10 text-black/55 font-semibold rounded-xl py-3.5 text-[14px]">
                Not yet
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 bg-[var(--color-ok)] text-white font-semibold rounded-xl py-3.5 text-[14px] active:scale-95 transition-transform disabled:opacity-60"
              >
                {submitting ? "Confirming…" : "I've paid ✓"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-[13px] text-black/40">{error || "Couldn't load payment details."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    pending_admin: { cls: "bg-amber-50 text-amber-700 border border-amber-200", Icon: Clock },
    assigned: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", Icon: CheckCircle2 },
    in_progress: { cls: "bg-emerald-50 text-emerald-700 border border-emerald-200", Icon: CheckCircle2 },
    awaiting_payment: { cls: "bg-amber-50 text-amber-700 border border-amber-200", Icon: IndianRupee },
    completed: { cls: "bg-black/5 text-black/45 border border-black/10", Icon: CheckCircle2 },
    rejected: { cls: "bg-red-50 text-red-600 border border-red-200", Icon: XCircle },
  };
  const { cls, Icon } = cfg[status] || cfg.pending_admin;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold shrink-0 ${cls}`}>
      <Icon size={11} />{STATUS_LABEL[status] || status}
    </span>
  );
}

function DetailRow({ label, value, last }) {
  return (
    <div className={`flex justify-between ${!last ? "pb-2 border-b border-black/4" : ""}`}>
      <span className="text-[11.5px] text-black/35">{label}</span>
      <span className="text-[12px] font-medium text-right max-w-[55%]">{value || "—"}</span>
    </div>
  );
}
