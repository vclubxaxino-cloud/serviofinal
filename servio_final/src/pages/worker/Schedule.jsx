import { useState, useEffect } from "react";
import { CalendarClock, MapPin, CheckCircle2, Clock } from "lucide-react";
import { api } from "../../api/client.js";
import StatusBadge from "../../components/shared/StatusBadge.jsx";

function groupByDate(jobs) {
  const map = {};
  jobs.forEach(j => {
    const key = j.date || "Flexible";
    if (!map[key]) map[key] = [];
    map[key].push(j);
  });
  // "Flexible" (no date) jobs sort to the end
  return Object.entries(map).sort(([a], [b]) => {
    if (a === "Flexible") return 1;
    if (b === "Flexible") return -1;
    return a.localeCompare(b);
  });
}

export default function Schedule() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/bookings/worker/jobs")
      .then(({ jobs }) => setJobs(jobs.filter(j => j.status !== "completed")))
      .catch((err) => setError(err.message || "Could not load your schedule."))
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
        <p className="font-semibold text-[15px]">Couldn't load your schedule</p>
        <p className="text-black/40 text-[13px] mt-2">{error}</p>
      </div>
    );
  }

  const groups = groupByDate(jobs);

  return (
    <div className="px-5 pt-6 pb-24">
      <h1 className="font-display text-[24px] font-bold">Schedule</h1>
      <p className="text-black/45 text-[13px] mt-1">Your upcoming jobs, day by day</p>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-black/5 flex items-center justify-center mb-4">
            <CalendarClock size={22} className="text-black/25" />
          </div>
          <p className="font-semibold text-[15px]">No jobs scheduled</p>
          <p className="text-black/38 text-[13px] mt-1.5">Confirmed jobs from admin appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 mt-5">
          {groups.map(([date, dateJobs]) => {
            const isFlexible = date === "Flexible";
            const d = isFlexible ? null : new Date(date);
            const isToday = d && new Date().toDateString() === d.toDateString();
            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-ink)] flex flex-col items-center justify-center shrink-0">
                    {isFlexible ? (
                      <Clock size={16} className="text-white/60" />
                    ) : (
                      <>
                        <p className="font-display font-bold text-white text-[17px] leading-none">{d.getDate()}</p>
                        <p className="text-white/45 text-[9.5px] uppercase">{d.toLocaleString("en-IN", { month: "short" })}</p>
                      </>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-[14px]">{isFlexible ? "Flexible date" : isToday ? "Today" : d.toLocaleString("en-IN", { weekday: "long" })}</p>
                    <p className="text-black/40 text-[11.5px]">{dateJobs.length} job{dateJobs.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 ml-15">
                  {dateJobs.map(job => (
                    <div key={job._id} className="bg-white border border-black/8 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[13.5px] flex-1">{job.serviceTitle}</p>
                        <StatusBadge status={job.status} />
                      </div>
                      <div className="flex flex-col gap-1.5 mt-2.5">
                        <div className="flex items-center gap-1.5 text-black/40 text-[12px]">
                          <CalendarClock size={12} className="shrink-0" /> {job.time || "Time TBD"}
                        </div>
                        <div className="flex items-center gap-1.5 text-black/40 text-[12px]">
                          <MapPin size={12} className="shrink-0" /> {job.address}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
