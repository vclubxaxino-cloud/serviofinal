import { useState, useEffect } from "react";
import { Wallet, ArrowDownToLine, TrendingUp, IndianRupee } from "lucide-react";
import { api } from "../../api/client.js";

export default function Earnings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/bookings/worker/jobs")
      .then(({ jobs }) => setJobs(jobs))
      .catch((err) => setError(err.message || "Could not load earnings."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center">
        <p className="font-semibold text-[15px]">Couldn't load earnings</p>
        <p className="text-black/40 text-[13px] mt-2">{error}</p>
      </div>
    );
  }

  const completed = jobs.filter(j => j.status === "completed");
  const pending   = jobs.filter(j => j.status !== "completed");
  const totalEarned = completed.reduce((s, j) => s + (j.payout || 0), 0);
  const pendingAmt  = pending.reduce((s, j) => s + Math.round((j.package?.price || 0) * 0.8), 0);

  return (
    <div className="px-5 pt-6 pb-24">
      <h1 className="font-display text-[24px] font-bold">Earnings</h1>
      <p className="text-black/45 text-[13px] mt-1">Your payout history & balance</p>

      {/* Balance card */}
      <div className="relative bg-[var(--color-ink)] rounded-3xl p-5 mt-5 overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[var(--color-gold)]/8" />
        <p className="text-white/45 text-[12px] flex items-center gap-1.5">
          <Wallet size={13} /> Total earned
        </p>
        <p className="font-display font-bold text-white text-[36px] mt-1">
          ₹{totalEarned.toLocaleString("en-IN")}
        </p>
        {pendingAmt > 0 && (
          <p className="text-[var(--color-gold)] text-[12.5px] mt-1">
            +₹{pendingAmt.toLocaleString("en-IN")} pending completion
          </p>
        )}
        <button className="mt-4 flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold rounded-xl px-4 py-2.5 text-[13px] active:scale-95 transition-transform">
          <ArrowDownToLine size={15} /> Request payout
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatCard label="Jobs done" value={completed.length} />
        <StatCard label="Pending" value={pending.length} />
        <StatCard label="Rating" value="4.8 ★" />
      </div>

      {/* Payout list */}
      <h2 className="font-display font-bold text-[15px] mt-6 mb-3">Payout history</h2>

      {jobs.length === 0 ? (
        <div className="text-center py-10 text-black/35 text-[13px]">No jobs yet — payouts appear here after completion.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {jobs.map((job) => {
            const amount = job.status === "completed" ? job.payout : Math.round((job.package?.price || 0) * 0.8);
            return (
              <div key={job._id} className="flex items-center justify-between bg-white border border-black/8 rounded-2xl px-4 py-3.5">
                <div>
                  <p className="text-[13.5px] font-medium">{job.serviceTitle}</p>
                  <p className="text-[11px] text-black/38 mt-0.5">{job.date || "Flexible"} · {job.status === "completed" ? "Paid" : "Pending"}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[14px] font-bold ${job.status === "completed" ? "text-[var(--color-ok)]" : "text-[var(--color-gold-deep)]"}`}>
                    {job.status === "completed" ? "+" : "~"}₹{amount?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-black/30 mt-0.5">{job.status === "completed" ? "Received" : "On completion"}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-3.5 text-center">
      <p className="font-display font-bold text-[18px]">{value}</p>
      <p className="text-[10.5px] text-black/40 mt-0.5">{label}</p>
    </div>
  );
}
