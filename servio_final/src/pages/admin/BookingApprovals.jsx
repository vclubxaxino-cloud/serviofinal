import { useState, useEffect } from "react";
import { Check, X, User, HardHat, CalendarDays, MapPin, Star, ChevronDown } from "lucide-react";
import { api } from "../../api/client.js";

export default function BookingApprovals() {
  const [pending, setPending] = useState([]);
  const [decided, setDecided] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  // Which booking's worker-picker is expanded + which worker is selected per booking
  const [pickerOpenFor, setPickerOpenFor] = useState(null);
  const [selectedWorkerByBooking, setSelectedWorkerByBooking] = useState({});
  const [approvedWorkers, setApprovedWorkers] = useState([]);
  const [workersLoaded, setWorkersLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingsRes, workersRes] = await Promise.all([
          api.get("/bookings/admin?status=pending_admin"),
          api.get("/workers/approved"),
        ]);
        setPending(bookingsRes.bookings);
        setApprovedWorkers(workersRes.workers);
      } catch (err) {
        setError(err.message || "Could not load booking requests.");
      } finally {
        setLoading(false);
        setWorkersLoaded(true);
      }
    };
    load();
  }, []);

  const workersForBooking = (booking) => {
    const skill = booking.service?.category?.name;
    // Online workers float to the top within each group — admin should see
    // who can actually take the job right now, first.
    const byOnline = (arr) => [...arr].sort((a, b) => (b.isOnline === true) - (a.isOnline === true));

    if (!skill) return byOnline(approvedWorkers);
    // Matching workers float to the top, rest still shown as options
    const matching = approvedWorkers.filter(w => w.skills.includes(skill));
    const rest = approvedWorkers.filter(w => !w.skills.includes(skill));
    return [...byOnline(matching), ...byOnline(rest)];
  };

  const approve = async (booking) => {
    const workerId = selectedWorkerByBooking[booking._id];
    if (!workerId) { setPickerOpenFor(booking._id); return; }

    setActingId(booking._id);
    try {
      const { booking: updated } = await api.patch(`/bookings/${booking._id}/approve`, { workerId });
      setPending((list) => list.filter((b) => b._id !== booking._id));
      setDecided((list) => [{ ...updated, approved: true }, ...list]);
    } catch (err) {
      setError(err.message || "Could not approve this booking. Please try again.");
    } finally {
      setActingId(null);
    }
  };

  const reject = async (booking) => {
    setActingId(booking._id);
    try {
      const { booking: updated } = await api.patch(`/bookings/${booking._id}/reject`);
      setPending((list) => list.filter((b) => b._id !== booking._id));
      setDecided((list) => [{ ...updated, approved: false }, ...list]);
    } catch (err) {
      setError(err.message || "Could not update this booking. Please try again.");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24">
      <h1 className="font-display text-[24px] font-bold">Booking Approvals</h1>
      <p className="text-black/45 text-[13px] mt-1">
        {pending.length > 0
          ? `${pending.length} request${pending.length > 1 ? "s" : ""} waiting on you`
          : "No pending requests"}
      </p>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-100 text-[var(--color-danger)] text-[12.5px] rounded-xl px-3 py-2.5">
          {error}
        </div>
      )}

      {workersLoaded && approvedWorkers.length === 0 && pending.length > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-100 text-amber-700 text-[12.5px] rounded-xl px-3 py-2.5">
          No approved partners yet — review the KYC queue first so you have someone to assign.
        </div>
      )}

      <div className="flex flex-col gap-4 mt-5">
        {pending.map((b) => {
          const options = workersForBooking(b);
          const chosenId = selectedWorkerByBooking[b._id];
          const chosenWorker = options.find(w => w._id === chosenId);
          const pickerOpen = pickerOpenFor === b._id;

          return (
            <div key={b._id} className="bg-white border border-black/10 rounded-2xl overflow-hidden">
              {/* Service info */}
              <div className="px-4 pt-4 pb-3 border-b border-black/5">
                <p className="font-display font-bold text-[15px]">{b.serviceTitle}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[12px] text-black/50">{b.package.label} plan</span>
                  <span className="font-bold text-[15px] text-[var(--color-gold-deep)]">
                    ₹{b.package.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="px-4 py-3 space-y-2.5">
                <DetailRow icon={<User size={13} />} label="Customer" value={b.user?.name} sub={b.user?.phone} />
                <DetailRow icon={<CalendarDays size={13} />} label="Date & time" value={`${b.date || "Flexible"} · ${b.time || "TBD"}`} />
                <DetailRow icon={<MapPin size={13} />} label="Address" value={b.address} />
              </div>

              {/* Worker assignment */}
              <div className="px-4 pb-3">
                <p className="text-[10.5px] text-black/35 uppercase tracking-wide font-semibold mb-1.5">Assign a partner</p>
                <button
                  onClick={() => setPickerOpenFor(pickerOpen ? null : b._id)}
                  className={`w-full flex items-center justify-between border rounded-xl px-3.5 py-3 text-left ${chosenWorker ? "border-[var(--color-ok)]/40 bg-[var(--color-ok)]/5" : "border-black/10 bg-white"}`}
                >
                  {chosenWorker ? (
                    <span className="flex items-center gap-2">
                      <HardHat size={14} className="text-[var(--color-ok)] shrink-0" />
                      <span className="text-[13px] font-medium">{chosenWorker.name}</span>
                      <span className="flex items-center gap-0.5 text-[11px] text-black/40">
                        <Star size={10} className="text-[var(--color-gold)] fill-[var(--color-gold)]" /> {chosenWorker.rating}
                      </span>
                      <OnlineBadge isOnline={chosenWorker.isOnline} compact />
                    </span>
                  ) : (
                    <span className="text-[13px] text-black/40">Select a partner…</span>
                  )}
                  <ChevronDown size={15} className={`text-black/30 transition-transform ${pickerOpen ? "rotate-180" : ""}`} />
                </button>

                {pickerOpen && (
                  <div className="mt-2 border border-black/10 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    {options.length === 0 && (
                      <p className="text-center text-[12px] text-black/35 py-4">No approved partners available.</p>
                    )}
                    {options.map((w) => {
                      const skillMatch = b.service?.category?.name && w.skills.includes(b.service.category.name);
                      return (
                        <button
                          key={w._id}
                          onClick={() => {
                            setSelectedWorkerByBooking((prev) => ({ ...prev, [b._id]: w._id }));
                            setPickerOpenFor(null);
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-3 border-b border-black/5 last:border-0 text-left active:bg-black/3"
                        >
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-display font-bold text-[var(--color-gold)] text-[13px]">
                              {w.name[0]}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${w.isOnline ? "bg-[var(--color-ok)]" : "bg-black/25"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[13px] font-medium truncate">{w.name}</p>
                              {skillMatch && <span className="text-[9px] font-semibold bg-[var(--color-ok)]/15 text-[var(--color-ok)] px-1.5 py-0.5 rounded-full shrink-0">Skill match</span>}
                              <OnlineBadge isOnline={w.isOnline} compact />
                            </div>
                            <p className="text-[10.5px] text-black/38 truncate">{w.skills.join(", ")}</p>
                          </div>
                          <span className="flex items-center gap-0.5 text-[11px] text-black/45 shrink-0">
                            <Star size={10} className="text-[var(--color-gold)] fill-[var(--color-gold)]" /> {w.rating}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 px-4 pb-4">
                <button
                  onClick={() => reject(b)}
                  disabled={actingId === b._id}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-danger)]/30 text-[var(--color-danger)] font-semibold rounded-xl py-3 text-[13px] active:scale-[0.97] transition-transform disabled:opacity-50"
                >
                  <X size={15} /> Decline
                </button>
                <button
                  onClick={() => approve(b)}
                  disabled={actingId === b._id}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-3 text-[13px] active:scale-[0.97] transition-transform disabled:opacity-50"
                >
                  <Check size={15} /> {chosenWorker ? "Confirm & Assign" : "Choose partner first"}
                </button>
              </div>

              <p className="text-[10.5px] text-black/30 text-center pb-3">Requested {new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          );
        })}

        {pending.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-[var(--color-ok)]/15 flex items-center justify-center mx-auto mb-3">
              <Check size={22} className="text-[var(--color-ok)]" />
            </div>
            <p className="font-semibold text-[15px]">All caught up</p>
            <p className="text-black/40 text-[13px] mt-1">No booking requests pending approval.</p>
          </div>
        )}
      </div>

      {/* Decided */}
      {decided.length > 0 && (
        <div className="mt-7">
          <h2 className="font-display font-bold text-[14px] mb-3 text-black/50">Recently actioned</h2>
          <div className="flex flex-col gap-2">
            {decided.map((b) => (
              <div key={b._id} className="flex items-center justify-between bg-white border border-black/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium">{b.serviceTitle}</p>
                  <p className="text-[11px] text-black/40">{b.workerName || "—"}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  b.approved ? "bg-[var(--color-ok)]/15 text-[var(--color-ok)]" : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                }`}>
                  {b.approved ? "Confirmed" : "Declined"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-black/35 mt-0.5 shrink-0">{icon}</span>
      <div>
        <span className="text-[10.5px] text-black/35 block">{label}</span>
        <span className="text-[13px] font-medium">{value || "—"}</span>
        {sub && <span className="text-[11px] text-black/40 block">{sub}</span>}
      </div>
    </div>
  );
}

function OnlineBadge({ isOnline, compact }) {
  if (compact) {
    return (
      <span className={`shrink-0 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full ${
        isOnline ? "bg-[var(--color-ok)]/15 text-[var(--color-ok)]" : "bg-black/8 text-black/40"
      }`}>
        {isOnline ? "ONLINE" : "OFFLINE"}
      </span>
    );
  }
  return (
    <span className={`shrink-0 flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-full ${
      isOnline ? "bg-[var(--color-ok)]/15 text-[var(--color-ok)]" : "bg-black/5 text-black/40"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[var(--color-ok)]" : "bg-black/30"}`} />
      {isOnline ? "Online" : "Offline"}
    </span>
  );
}
