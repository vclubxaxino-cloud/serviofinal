import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck2,
  MapPinned,
  Bell,
  HeadphonesIcon,
  LogOut,
  ChevronRight,
  Star,
  X,
  Plus,
  AlertCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  Phone,
  MessageSquare
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";

export default function WorkerProfile() {
  const { actor, logout } = useAuth();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  const loadWorker = () =>
    api
      .get("/workers/me")
      .then(({ worker }) => setWorker(worker))
      .catch(() => {});

  useEffect(() => {
    loadWorker();
    api
      .get("/bookings/worker/jobs")
      .then(({ jobs }) => setJobs(jobs))
      .catch(() => {});
    const onExternalChange = (e) =>
      setWorker((w) => (w ? { ...w, isOnline: e.detail.isOnline } : w));
    window.addEventListener("servio:worker-status", onExternalChange);
    return () => window.removeEventListener("servio:worker-status", onExternalChange);
  }, []);

  const completed = jobs.filter((j) => j.status === "completed");
  const totalEarned = completed.reduce((s, j) => s + (j.payout || 0), 0);

  const toggleOnline = async () => {
    if (!worker || statusSaving) return;
    const next = !worker.isOnline;
    setStatusError("");
    setWorker((w) => ({ ...w, isOnline: next }));
    setStatusSaving(true);
    try {
      const { worker: updated } = await api.patch("/workers/me/status", {
        isOnline: next,
      });
      setWorker(updated);
      window.dispatchEvent(
        new CustomEvent("servio:worker-status", {
          detail: { isOnline: updated.isOnline },
        })
      );
    } catch (err) {
      setWorker((w) => ({ ...w, isOnline: !next }));
      setStatusError(err.message || "Could not update your status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const [showKyc, setShowKyc] = useState(false);
  const [showAreas, setShowAreas] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const MENU = [
    {
      label: "KYC Documents",
      desc: worker?.kycStatus === "approved" ? "Verified" : "Pending review",
      Icon: FileCheck2,
      onClick: () => setShowKyc(true),
    },
    {
      label: "Service Areas",
      desc: "Manage your active zones",
      Icon: MapPinned,
      onClick: () => setShowAreas(true),
    },
    {
      label: "Notification Settings",
      desc: "Manage job alerts",
      Icon: Bell,
      onClick: () => setShowNotifications(true),
    },
    {
      label: "Help & Support",
      desc: "Get help with a job",
      Icon: HeadphonesIcon,
      onClick: () => setShowSupport(true),
    },
  ];

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      {/* Profile & Stats Header Card */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-black rounded-3xl p-6 overflow-hidden border border-zinc-800/80 shadow-2xl">
        {/* Ambient Glow Effects */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-bold text-zinc-950 text-2xl shadow-lg shadow-amber-500/20">
              {(actor?.name || "W")[0].toUpperCase()}
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-900 ${
                worker?.isOnline
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  : "bg-zinc-600"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg tracking-tight truncate">
              {actor?.name || "Partner"}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-amber-300 text-[12px] font-semibold">
                  {worker?.rating ?? "—"}
                </span>
              </div>
              <span className="text-zinc-400 text-[11px] font-medium flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" /> Verified Partner
              </span>
            </div>
          </div>
        </div>

        {/* Online/Offline availability toggle */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-800/80 relative z-10">
          <div>
            <p className="text-white text-[13.5px] font-semibold flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  worker?.isOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                }`}
              />
              {worker?.isOnline ? "You're Online" : "You're Offline"}
            </p>
            <p className="text-zinc-400 text-[11px] mt-0.5">
              {worker?.kycStatus !== "approved"
                ? "Available after KYC approval"
                : worker?.isOnline
                ? "Admin can assign you new jobs"
                : "Turn on to receive new jobs"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleOnline}
            disabled={statusSaving || worker?.kycStatus !== "approved"}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-40 ${
              worker?.isOnline
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
                : "bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                worker?.isOnline ? "translate-x-[20px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {statusError && (
          <p className="text-rose-400 text-[11px] font-medium mt-2">{statusError}</p>
        )}

        {/* Key Performance Stats */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-zinc-800/80 relative z-10 text-center">
          <Stat label="Jobs Done" value={jobs.length} />
          <Stat label="Completed" value={completed.length} />
          <Stat label="Earned" value={`₹${totalEarned.toLocaleString("en-IN")}`} />
        </div>
      </div>

      {/* Action Menu Links */}
      <div className="flex flex-col gap-3 mt-6">
        {MENU.map(({ label, desc, Icon, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="group flex items-center gap-3.5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl px-4 py-3.5 text-left shadow-sm active:scale-[0.99] hover:border-amber-500/40 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-slate-800 dark:text-zinc-100 truncate">
                {label}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                {desc}
              </p>
            </div>
            <ChevronRight
              size={16}
              className="text-slate-400 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </button>
        ))}
      </div>

      {/* Logout Action */}
      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="w-full flex items-center justify-center gap-2 mt-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-semibold rounded-2xl py-3.5 text-[14px] active:scale-[0.99] transition-all duration-200 shadow-sm"
      >
        <LogOut size={16} /> Log out
      </button>

      {/* Modals & Bottom Sheets */}
      {showKyc && <KycSheet worker={worker} onClose={() => setShowKyc(false)} />}
      {showAreas && (
        <ServiceAreasSheet
          worker={worker}
          onClose={() => setShowAreas(false)}
          onUpdated={loadWorker}
        />
      )}
      {showNotifications && (
        <NotificationSheet onClose={() => setShowNotifications(false)} />
      )}
      {showSupport && <SupportSheet onClose={() => setShowSupport(false)} />}
    </div>
  );
}

function KycSheet({ worker, onClose }) {
  const statusCfg = {
    approved: {
      label: "Verified",
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    pending: {
      label: "Pending Review",
      cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    rejected: {
      label: "Action Required",
      cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  };
  const cfg = statusCfg[worker?.kycStatus] || statusCfg.pending;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl w-full max-w-md px-6 pt-4 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100">
            KYC Verification
          </h2>
          <span
            className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${cfg.cls}`}
          >
            {cfg.label}
          </span>
        </div>
        <p className="text-slate-500 dark:text-zinc-400 text-[13px] mt-1 mb-5">
          Submitted identity & address verification documents.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl px-4 py-3.5">
            <CreditCard size={18} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800 dark:text-zinc-200">
                Aadhaar Card
              </p>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 font-mono mt-0.5">
                {worker?.aadhaarNumber || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl px-4 py-3.5">
            <FileText size={18} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-[13.5px] font-semibold text-slate-800 dark:text-zinc-200">
                Secondary ID Document
              </p>
              <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {worker?.kycDocType || "—"}
              </p>
            </div>
          </div>
        </div>

        {worker?.kycStatus === "rejected" && (
          <div className="mt-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl px-4 py-3 text-[12px] text-rose-600 dark:text-rose-300 font-medium">
            Your documents could not be verified. Please contact support at +91 99920 94134 to resubmit.
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl py-3.5 text-[14px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ServiceAreasSheet({ worker, onClose, onUpdated }) {
  const [areas, setAreas] = useState(worker?.serviceAreas || []);
  const [newPincode, setNewPincode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAreas(worker?.serviceAreas || []);
  }, [worker]);

  const addPincode = () => {
    const cleaned = newPincode.trim();
    if (!/^\d{6}$/.test(cleaned)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }
    if (areas.includes(cleaned)) {
      setError("This pincode is already added.");
      return;
    }
    setAreas((a) => [...a, cleaned]);
    setNewPincode("");
    setError("");
  };

  const removePincode = (p) => setAreas((a) => a.filter((x) => x !== p));

  const handleSave = async () => {
    if (areas.length === 0) {
      setError("Add at least one pincode.");
      return;
    }
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl w-full max-w-md px-6 pt-4 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />
        <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100">
          Service Areas
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 text-[13px] mt-1 mb-5">
          Select pin codes where you are available to receive job requests.
        </p>

        <div className="flex flex-wrap gap-2 mb-4 max-h-36 overflow-y-auto">
          {areas.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-[13px] font-semibold"
            >
              {p}
              <button
                type="button"
                onClick={() => removePincode(p)}
                className="hover:text-amber-900 dark:hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </span>
          ))}
          {areas.length === 0 && (
            <p className="text-[13px] text-slate-400 dark:text-zinc-500 py-2">
              No pincodes added yet.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={newPincode}
            onChange={(e) => {
              setNewPincode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && addPincode()}
            placeholder="Enter 6-digit pincode"
            inputMode="numeric"
            className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 px-4 py-3 text-[14px] text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500/50 font-mono placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={addPincode}
            className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-500 text-[12px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl px-3 py-2.5 mt-3">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-semibold rounded-xl py-3.5 text-[14px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl py-3.5 text-[14px] disabled:opacity-60 shadow-md shadow-amber-500/20"
          >
            {saving ? "Saving…" : "Save Changes"}
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
    api
      .get("/workers/me")
      .then(({ worker }) =>
        setPrefs(
          worker.notificationPrefs || { jobAlerts: true, payoutUpdates: true }
        )
      )
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
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl w-full max-w-md px-6 pt-4 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />
        <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100">
          Notification Preferences
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 text-[13px] mt-1 mb-5">
          Manage how and when you want to receive alerts.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="w-6 h-6 border-2 border-slate-200 dark:border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Job Alerts"
              desc="Instant notifications for new job assignments"
              checked={prefs.jobAlerts}
              onToggle={() => toggle("jobAlerts")}
              disabled={saving}
            />
            <ToggleRow
              label="Payout Updates"
              desc="Notifications when earnings are transferred"
              checked={prefs.payoutUpdates}
              onToggle={() => toggle("payoutUpdates")}
              disabled={saving}
            />
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl py-3.5 text-[14px] font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onToggle, disabled }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl px-4 py-3.5">
      <div>
        <p className="text-[13.5px] font-semibold text-slate-800 dark:text-zinc-200">
          {label}
        </p>
        <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
          {desc}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out disabled:opacity-50 ${
          checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-[20px]" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SupportSheet({ onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 rounded-t-3xl w-full max-w-md px-6 pt-4 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />
        <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-100">
          Help & Support
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 text-[13px] mt-1 mb-5">
          Reach our dedicated support team directly.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="tel:+919992094134"
            className="flex items-center gap-3.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-2xl px-4 py-4 hover:border-amber-500/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 text-zinc-950 font-bold">
              <Phone size={18} />
            </div>
            <div>
              <p className="font-bold text-[14px] text-slate-800 dark:text-zinc-100">
                Call Support
              </p>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5">
                +91 99920 94134 · Mon–Sat, 9am–8pm
              </p>
            </div>
          </a>
          <a
            href="https://wa.me/919992094134"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl px-4 py-4 hover:border-emerald-500/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 text-white font-bold">
              <MessageSquare size={18} />
            </div>
            <div>
              <p className="font-bold text-[14px] text-slate-800 dark:text-zinc-100">
                WhatsApp Support
              </p>
              <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Quick responses on WhatsApp chat
              </p>
            </div>
          </a>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl py-3.5 text-[14px] font-semibold text-slate-700 dark:text-zinc-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <p className="font-bold text-white text-lg tracking-tight">{value}</p>
      <p className="text-zinc-400 text-[11px] font-medium mt-0.5">{label}</p>
    </div>
  );
}