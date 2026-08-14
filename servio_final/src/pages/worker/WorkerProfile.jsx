import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileCheck2, MapPinned, Bell, HeadphonesIcon, LogOut, ChevronRight, Star, IndianRupee, X, Plus, Trash2, AlertCircle, FileText, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";

export default function WorkerProfile() {
  const { actor, logout } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [jobs, setJobs] = useState([]);

  const loadWorker = () => api.get("/workers/me").then(({ worker }) => setWorker(worker)).catch(() => {});

  useEffect(() => {
    loadWorker();
    api.get("/bookings/worker/jobs").then(({ jobs }) => setJobs(jobs)).catch(() => {});
  }, []);

  const completed = jobs.filter(j => j.status === "completed");
  const totalEarned = completed.reduce((s, j) => s + (j.payout || 0), 0);

  const [showKyc, setShowKyc] = useState(false);
  const [showAreas, setShowAreas] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const MENU = [
    { label: "KYC Documents", desc: worker?.kycStatus === "approved" ? "Verified" : "Pending review", Icon: FileCheck2, onClick: () => setShowKyc(true) },
    { label: "Service Areas", desc: "Manage your active zones", Icon: MapPinned, onClick: () => setShowAreas(true) },
    { label: "Notification Settings", desc: "Manage job alerts", Icon: Bell, onClick: () => setShowNotifications(true) },
    { label: "Help & Support", desc: "Get help with a job", Icon: HeadphonesIcon, onClick: () => setShowSupport(true) },
  ];

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="relative bg-[var(--color-ink)] rounded-3xl p-5 overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[var(--color-gold)]/10" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)] flex items-center justify-center font-display font-bold text-[var(--color-ink)] text-2xl shrink-0">
            {(actor?.name || "W")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-display font-bold text-[17px]">{actor?.name || "Partner"}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
              <span className="text-[var(--color-gold)] text-[12px] font-semibold">{worker?.rating ?? "—"}</span>
              <span className="text-white/30 text-[11px] ml-1">· Verified Partner</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-5 pt-4 border-t border-white/10">
          <Stat label="Jobs Done" value={jobs.length} />
          <div className="w-px bg-white/10" />
          <Stat label="Completed" value={completed.length} />
          <div className="w-px bg-white/10" />
          <Stat label="Earned" value={`₹${totalEarned.toLocaleString("en-IN")}`} />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-6">
        {MENU.map(({ label, desc, Icon, onClick }) => (
          <button key={label} onClick={onClick} className="flex items-center gap-3.5 bg-white border border-black/8 rounded-2xl px-4 py-3.5 text-left active:bg-black/2 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/12 flex items-center justify-center text-[var(--color-gold-deep)] shrink-0">
              <Icon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-medium">{label}</p>
              <p className="text-[11.5px] text-black/38">{desc}</p>
            </div>
            <ChevronRight size={15} className="text-black/20" />
          </button>
        ))}
      </div>

      <button
        onClick={() => { logout(); navigate("/"); }}
        className="w-full flex items-center justify-center gap-2 mt-5 border border-[var(--color-danger)]/25 text-[var(--color-danger)] font-semibold rounded-2xl py-3.5 text-[14px] active:bg-red-50 transition-colors"
      >
        <LogOut size={16} /> Log out
      </button>

      {showKyc && <KycSheet worker={worker} onClose={() => setShowKyc(false)} />}
      {showAreas && <ServiceAreasSheet worker={worker} onClose={() => setShowAreas(false)} onUpdated={loadWorker} />}
      {showNotifications && <NotificationSheet onClose={() => setShowNotifications(false)} />}
      {showSupport && <SupportSheet onClose={() => setShowSupport(false)} />}
    </div>
  );
}

function KycSheet({ worker, onClose }) {
  const statusCfg = {
    approved: { label: "Verified", cls: "bg-[var(--color-ok)]/15 text-[var(--color-ok)]" },
    pending: { label: "Pending review", cls: "bg-amber-50 text-amber-700" },
    rejected: { label: "Rejected — contact support", cls: "bg-red-50 text-red-600" },
  };
  const cfg = statusCfg[worker?.kycStatus] || statusCfg.pending;

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-[18px]">KYC Documents</h2>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
        </div>
        <p className="text-black/40 text-[13px] mt-1 mb-5">Documents submitted at signup.</p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 border border-black/10 rounded-xl px-4 py-3.5">
            <CreditCard size={16} className="text-[var(--color-gold-deep)] shrink-0" />
            <div>
              <p className="text-[13.5px] font-medium">Aadhaar Card</p>
              <p className="text-[11px] text-black/40">{worker?.aadhaarNumber || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border border-black/10 rounded-xl px-4 py-3.5">
            <FileText size={16} className="text-[var(--color-gold-deep)] shrink-0" />
            <div>
              <p className="text-[13.5px] font-medium">Second ID document</p>
              <p className="text-[11px] text-black/40">{worker?.kycDocType || "—"}</p>
            </div>
          </div>
        </div>

        {worker?.kycStatus === "rejected" && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3 text-[12px] text-red-700">
            Your documents couldn't be verified. Please contact support at +91 99920 94134 to resubmit.
          </div>
        )}

        <button onClick={onClose} className="mt-5 w-full border border-black/10 rounded-xl py-3 text-[14px] font-medium text-black/55">Close</button>
      </div>
    </div>
  );
}

function ServiceAreasSheet({ worker, onClose, onUpdated }) {
  const [areas, setAreas] = useState(worker?.serviceAreas || []);
  const [newPincode, setNewPincode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setAreas(worker?.serviceAreas || []); }, [worker]);

  const addPincode = () => {
    const cleaned = newPincode.trim();
    if (!/^\d{6}$/.test(cleaned)) { setError("Enter a valid 6-digit pincode."); return; }
    if (areas.includes(cleaned)) { setError("This pincode is already added."); return; }
    setAreas((a) => [...a, cleaned]);
    setNewPincode("");
    setError("");
  };

  const removePincode = (p) => setAreas((a) => a.filter((x) => x !== p));

  const handleSave = async () => {
    if (areas.length === 0) { setError("Add at least one pincode."); return; }
    setError("");
    setSaving(true);
    try {
      await api.patch("/workers/me/service-areas", { serviceAreas: areas });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || "Could not save your service areas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
        <h2 className="font-display font-bold text-[18px]">Service Areas</h2>
        <p className="text-black/40 text-[13px] mt-1 mb-5">Pincodes where you're available to work.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {areas.map((p) => (
            <span key={p} className="flex items-center gap-1.5 bg-[var(--color-gold)]/10 text-[var(--color-gold-deep)] px-3 py-1.5 rounded-full text-[12.5px] font-medium">
              {p}
              <button onClick={() => removePincode(p)}><X size={12} /></button>
            </span>
          ))}
          {areas.length === 0 && <p className="text-[12.5px] text-black/35">No pincodes added yet.</p>}
        </div>

        <div className="flex gap-2">
          <input
            value={newPincode}
            onChange={(e) => { setNewPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && addPincode()}
            placeholder="Add pincode"
            inputMode="numeric"
            className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-[14px] outline-none focus:border-[var(--color-gold)] font-mono"
          />
          <button onClick={addPincode} className="w-11 h-11 rounded-xl bg-[var(--color-ink)] text-white flex items-center justify-center shrink-0">
            <Plus size={16} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[var(--color-danger)] text-[12.5px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mt-3">
            <AlertCircle size={13} className="shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-black/10 text-black/55 font-semibold rounded-xl py-3.5 text-[14px]">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-3.5 text-[14px] disabled:opacity-60">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSheet({ onClose }) {
  const [prefs, setPrefs] = useState({ jobAlerts: true, payoutUpdates: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/workers/me")
      .then(({ worker }) => setPrefs(worker.notificationPrefs || { jobAlerts: true, payoutUpdates: true }))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await api.patch("/workers/me/notification-prefs", updated);
    } catch {
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
        <h2 className="font-display font-bold text-[18px]">Notification Settings</h2>
        <p className="text-black/40 text-[13px] mt-1 mb-5">Choose what you'd like to hear about.</p>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="w-6 h-6 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ToggleRow label="Job alerts" desc="New job assignments" checked={prefs.jobAlerts} onToggle={() => toggle("jobAlerts")} disabled={saving} />
            <ToggleRow label="Payout updates" desc="When your earnings are settled" checked={prefs.payoutUpdates} onToggle={() => toggle("payoutUpdates")} disabled={saving} />
          </div>
        )}

        <button onClick={onClose} className="mt-6 w-full border border-black/10 rounded-xl py-3 text-[14px] font-medium text-black/55">Done</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onToggle, disabled }) {
  return (
    <div className="flex items-center justify-between bg-[var(--color-paper-dim)] border border-black/8 rounded-xl px-4 py-3.5">
      <div>
        <p className="text-[13.5px] font-medium">{label}</p>
        <p className="text-[11.5px] text-black/40">{desc}</p>
      </div>
      <button onClick={onToggle} disabled={disabled} className={`w-11 h-6 rounded-full relative transition-colors shrink-0 disabled:opacity-50 ${checked ? "bg-[var(--color-ok)]" : "bg-black/15"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function SupportSheet({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
        <h2 className="font-display font-bold text-[18px]">Help & Support</h2>
        <p className="text-black/40 text-[13px] mt-1 mb-5">We're here to help — reach us anytime.</p>
        <div className="flex flex-col gap-3">
          <a href="tel:+919992094134" className="flex items-center gap-3 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 rounded-2xl px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)] flex items-center justify-center shrink-0">
              <HeadphonesIcon size={18} className="text-[var(--color-ink)]" />
            </div>
            <div>
              <p className="font-semibold text-[14px]">Call us</p>
              <p className="text-[12px] text-black/45">+91 99920 94134 · Mon–Sat, 9am–8pm</p>
            </div>
          </a>
          <a href="https://wa.me/919992094134" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0 text-white font-bold">W</div>
            <div>
              <p className="font-semibold text-[14px]">WhatsApp</p>
              <p className="text-[12px] text-black/45">Quick response on WhatsApp</p>
            </div>
          </a>
        </div>
        <button onClick={onClose} className="mt-5 w-full border border-black/10 rounded-xl py-3 text-[14px] font-medium text-black/55">Close</button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center flex-1">
      <p className="font-display font-bold text-white text-[18px]">{value}</p>
      <p className="text-white/35 text-[10.5px] mt-0.5">{label}</p>
    </div>
  );
}
