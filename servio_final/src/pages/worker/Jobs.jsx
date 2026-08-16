import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, CalendarDays, MapPin, IndianRupee, ChevronRight, Phone } from "lucide-react";
import { api } from "../../api/client.js";
import OnlineStatusBar from "../../components/worker/OnlineStatusBar.jsx";

const STATUS_CFG = {
  assigned:  { label: "Assigned", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  in_progress: { label: "In progress", color: "bg-blue-50 text-blue-700 border border-blue-200" },
  awaiting_payment: { label: "Awaiting payment", color: "bg-amber-50 text-amber-700 border border-amber-200" },
  completed: { label: "Completed", color: "bg-black/5 text-black/45 border border-black/10" },
};

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    api.get("/bookings/worker/jobs")
      .then(({ jobs }) => setJobs(jobs))
      .catch((err) => setError(err.message || "Could not load your jobs."))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = jobs.filter(j => j.status === "assigned" || j.status === "in_progress" || j.status === "awaiting_payment");
  const past = jobs.filter(j => j.status === "completed");
  const display = activeTab === "upcoming" ? upcoming : past;

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
        <p className="font-semibold text-[15px]">Couldn't load your jobs</p>
        <p className="text-black/40 text-[13px] mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-28 page-enter">
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[24px] font-bold">My Jobs</h1>
            <p className="text-black/45 text-[13px] mt-1">Admin confirms all bookings before they reach you</p>
          </div>
        </div>
        <OnlineStatusBar />
        <div className="flex gap-2 mt-4">
          {[{ key: "upcoming", label: `Upcoming (${upcoming.length})` }, { key: "past", label: `Completed (${past.length})` }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-full text-[12.5px] font-semibold border transition-all ${activeTab === t.key ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]" : "bg-white text-black/50 border-black/10"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 flex flex-col gap-3">
        {display.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-4">
              <Clock size={22} className="text-black/30" />
            </div>
            <p className="font-semibold text-[15px]">{activeTab === "upcoming" ? "No upcoming jobs" : "No completed jobs yet"}</p>
            <p className="text-black/40 text-[13px] mt-2 leading-relaxed">
              {activeTab === "upcoming" ? "Once admin confirms a booking, it appears here." : "Completed jobs will show here after you mark them done."}
            </p>
          </div>
        )}
        {display.map(j => {
          const payout = j.payout ?? Math.round((j.package?.price || 0) * 0.8);
          return (
            <button key={j._id} onClick={() => navigate(`/worker/jobs/${j._id}`)}
              className="bg-white border border-black/8 rounded-2xl p-4 text-left active:scale-[0.97] transition-transform shadow-sm">
              <div className={`h-1 w-full rounded-full mb-3 ${j.status === "completed" ? "bg-black/10" : "bg-[var(--color-ok)]"}`} />
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-[14px] flex-1">{j.serviceTitle}</p>
                <span className={`shrink-0 text-[10.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS_CFG[j.status]?.color || "bg-black/5 text-black/45"}`}>
                  {STATUS_CFG[j.status]?.label || j.status}
                </span>
              </div>
              <p className="text-[12px] text-black/45 mt-0.5">{j.package?.label}</p>
              <div className="flex flex-col gap-1.5 mt-3">
                <div className="flex items-center gap-2 text-[12px] text-black/50">
                  <CalendarDays size={12} className="shrink-0" />{j.date || "Flexible"} · {j.time || "TBD"}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-black/50">
                  <MapPin size={12} className="shrink-0" />{j.address}
                </div>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--color-gold-deep)]">
                  <IndianRupee size={12} className="shrink-0" />₹{payout.toLocaleString("en-IN")} payout
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5">
                <div className="flex items-center gap-1.5 text-[12px] text-black/45">
                  <Phone size={12} className="shrink-0" />{j.user?.name}
                </div>
                <ChevronRight size={14} className="text-black/25" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
