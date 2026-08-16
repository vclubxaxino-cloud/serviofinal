import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { api } from "../../api/client.js";

// Premium Online Status Bar Component
export default function OnlineStatusBar() {
  const [worker, setWorker] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    api
      .get("/workers/me")
      .then(({ worker }) => setWorker(worker))
      .catch(() => {});

  useEffect(() => {
    load();
    const onExternalChange = (e) =>
      setWorker((w) => (w ? { ...w, isOnline: e.detail.isOnline } : w));
    window.addEventListener("servio:worker-status", onExternalChange);
    return () => window.removeEventListener("servio:worker-status", onExternalChange);
  }, []);

  const toggle = async () => {
    if (!worker || saving) return;
    const next = !worker.isOnline;
    setError("");
    setWorker((w) => ({ ...w, isOnline: next }));
    setSaving(true);
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
      setError(err.message || "Could not update your status.");
    } finally {
      setSaving(false);
    }
  };

  if (!worker) return null;

  const kycBlocked = worker.kycStatus !== "approved";

  return (
    <div className="mt-4">
      <div
        className={`relative flex items-center justify-between gap-4 rounded-2xl px-5 py-3.5 border transition-all duration-300 backdrop-blur-md ${
          worker.isOnline
            ? "bg-emerald-500/10 border-emerald-500/25 shadow-[0_4px_20px_rgba(16,185,129,0.12)]"
            : "bg-slate-900/5 border-slate-200/60 shadow-sm dark:bg-zinc-900/40 dark:border-zinc-800"
        }`}
      >
        {/* Status Indicator & Text */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                worker.isOnline
                  ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                  : "bg-slate-400 dark:bg-zinc-600"
              }`}
            />
            {worker.isOnline && (
              <span className="absolute w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-tight text-slate-800 dark:text-zinc-100">
              {worker.isOnline ? "Online — Visible to Admin" : "Offline — Hidden from Admin"}
            </p>
            {kycBlocked && (
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                Complete KYC to go online
              </p>
            )}
          </div>
        </div>

        {/* Premium Toggle Switch */}
        <button
          type="button"
          onClick={toggle}
          disabled={saving || kycBlocked}
          aria-label="Toggle Online Status"
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-40 ${
            worker.isOnline
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
              : "bg-slate-300 dark:bg-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)]"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 ${
              worker.isOnline ? "translate-x-[20px]" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-rose-500 text-[11.5px] font-medium mt-2.5 px-1 animate-fadeIn">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}