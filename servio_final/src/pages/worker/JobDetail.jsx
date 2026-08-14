import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Phone, IndianRupee, CheckCircle2, Navigation2, Clock3, Ban } from "lucide-react";
import { api } from "../../api/client.js";
import { useState, useEffect } from "react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api.get(`/bookings/worker/jobs/${id}`)
      .then(({ job }) => setJob(job))
      .catch((err) => setLoadError(err.message || "Could not load this job."))
      .finally(() => setLoadingJob(false));
  }, [id]);

  const markWorkDone = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const { booking } = await api.patch(`/bookings/${id}/work-done`);
      setJob((prev) => ({ ...prev, ...booking }));
    } catch (err) {
      setLoadError(err.message || "Could not update this job.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !job) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center">
        <p className="font-semibold text-[15px]">Couldn't load this job</p>
        <p className="text-black/40 text-[13px] mt-2">{loadError}</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-[var(--color-ink)] text-white font-semibold rounded-xl px-5 py-2.5 text-[13px]">Go back</button>
      </div>
    );
  }

  const isAssigned = job.status === "assigned" || job.status === "in_progress";
  const isAwaitingPayment = job.status === "awaiting_payment";
  const isCompleted = job.status === "completed";
  const payout = job.payout ?? Math.round((job.package?.price || 0) * 0.8);
  const customerPhone = job.user?.phone;

  const statusBadge = isCompleted
    ? { cls: "bg-[var(--color-ok)]/20 text-[var(--color-ok)]", Icon: CheckCircle2, label: "Payment confirmed" }
    : isAwaitingPayment
    ? { cls: "bg-amber-500/20 text-amber-300", Icon: Clock3, label: "Awaiting customer payment" }
    : { cls: "bg-[var(--color-gold)]/20 text-[var(--color-gold)]", Icon: CalendarDays, label: "Assigned" };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] pb-28">
      <div className="bg-[var(--color-ink)] px-5 pt-14 pb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white mb-4 active:scale-90 transition-transform">
          <ArrowLeft size={16} />
        </button>
        <p className="text-white/50 text-[12px] uppercase tracking-widest">Job detail</p>
        <h1 className="font-display text-[20px] font-bold text-white mt-0.5">{job.serviceTitle}</h1>
        <p className="text-white/60 text-[13px] mt-0.5">{job.package?.label}</p>
        <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold ${statusBadge.cls}`}>
          <statusBadge.Icon size={12} /> {statusBadge.label}
        </div>
      </div>

      {/* Strict no-cash notice — always visible to the worker */}
      <div className="mx-5 mt-4 flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
        <Ban size={15} className="text-[var(--color-danger)] mt-0.5 shrink-0" />
        <p className="text-[12px] text-red-700 leading-relaxed">
          <b>Do not accept cash.</b> Servio is UPI-only — the customer pays via the app's QR code and
          the booking only completes once their payment is verified.
        </p>
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        <Section label="Customer">
          <Row icon={<Phone size={13} />} label="Name" value={job.user?.name} />
          <Row icon={<Phone size={13} />} label="Phone" value={customerPhone} action={
            customerPhone && <a href={`tel:${customerPhone.replace(/\s/g, "")}`} className="text-[11px] bg-[var(--color-ink)] text-white px-2.5 py-1 rounded-lg font-semibold">Call</a>
          } />
        </Section>

        <Section label="Schedule">
          <Row icon={<CalendarDays size={13} />} label="Date & time" value={`${job.date || "Flexible"} · ${job.time || "TBD"}`} />
          <Row icon={<MapPin size={13} />} label="Address" value={job.address} action={
            <a href={`https://maps.google.com?q=${encodeURIComponent(job.address)}`} target="_blank" rel="noopener noreferrer"
              className="text-[11px] bg-blue-500 text-white px-2.5 py-1 rounded-lg font-semibold">Map</a>
          } />
        </Section>

        <Section label="Earnings">
          <Row icon={<IndianRupee size={13} />} label="Your payout" value={`₹${payout.toLocaleString("en-IN")}`} />
          <Row icon={<IndianRupee size={13} />} label="Service total" value={`₹${job.package?.price?.toLocaleString("en-IN")}`} />
          <p className="text-[11.5px] text-black/40 mt-1 px-1">
            Paid strictly via UPI by the customer through the app. Your payout is settled by admin once payment is confirmed.
          </p>
        </Section>

        {isAwaitingPayment && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-4">
            <Clock3 size={20} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-[13px] text-amber-800 font-semibold">Waiting for customer to pay</p>
              <p className="text-[11.5px] text-amber-700/80 mt-0.5">The customer has been asked to pay via UPI and confirm in their app.</p>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-3 bg-[var(--color-ok)]/10 border border-[var(--color-ok)]/20 rounded-2xl px-4 py-4">
            <CheckCircle2 size={20} className="text-[var(--color-ok)] shrink-0" />
            <div>
              <p className="text-[13px] text-[var(--color-ok)] font-semibold">Payment verified — job complete</p>
              <p className="text-[11.5px] text-black/40 mt-0.5">
                UPI ref: {job.payment?.upiRef || "—"} · Admin will process your payout shortly.
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <a href={customerPhone ? `tel:${customerPhone.replace(/\s/g, "")}` : undefined}
            className="flex-1 flex items-center justify-center gap-2 border border-black/10 text-black/55 font-semibold rounded-xl py-3 text-[13px] active:scale-95 transition-transform">
            <Phone size={14} /> Call customer
          </a>
          <a href={`https://maps.google.com?q=${encodeURIComponent(job.address)}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 border border-black/10 text-black/55 font-semibold rounded-xl py-3 text-[13px] active:scale-95 transition-transform">
            <Navigation2 size={14} /> Get directions
          </a>
        </div>
      </div>

      {isAssigned && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-black/10 px-5 py-4 safe-bottom">
          <button onClick={() => setShowConfirm(true)} disabled={loading}
            className="w-full bg-[var(--color-ok)] text-white font-bold rounded-xl py-4 text-[15px] disabled:opacity-60 active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
            {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Marking…</> : <><CheckCircle2 size={18} /> Mark work as done</>}
          </button>
          <p className="text-[11px] text-black/35 text-center mt-2">Customer will be asked to pay via UPI — do not accept cash</p>
        </div>
      )}

      {/* Confirm sheet */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
            <h2 className="font-display font-bold text-[18px]">Confirm work is done?</h2>
            <p className="text-black/45 text-[13px] mt-2 leading-relaxed">
              This tells the customer to pay via the app's UPI QR code. <b>Do not accept cash</b> —
              this job only shows as complete once their payment is verified.
            </p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConfirm(false)} className="flex-1 border border-black/10 text-black/55 font-semibold rounded-xl py-3.5 text-[14px]">Cancel</button>
              <button onClick={markWorkDone} className="flex-1 bg-[var(--color-ok)] text-white font-bold rounded-xl py-3.5 text-[14px]">Yes, work is done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl px-4 py-4">
      <p className="text-[11px] font-semibold text-black/35 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({ icon, label, value, action }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-black/35 mt-0.5 shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-[10.5px] text-black/35">{label}</p>
        <p className="text-[13.5px] font-medium">{value || "—"}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
