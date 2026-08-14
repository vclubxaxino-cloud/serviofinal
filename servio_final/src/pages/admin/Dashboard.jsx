import { useState, useEffect } from "react";
import { Users2, HardHat, Clock3, IndianRupee, CalendarCheck, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Dashboard() {
  const { actor } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, workersRes, bookingsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/workers/pending"),
          api.get("/bookings/admin?status=pending_admin"),
        ]);
        setStats(statsRes.stats);
        setPendingWorkers(workersRes.workers);
        setPendingBookings(bookingsRes.bookings);
      } catch (err) {
        setError(err.message || "Could not load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center">
        <p className="font-semibold text-[15px]">Couldn't load the dashboard</p>
        <p className="text-black/40 text-[13px] mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24">
      <p className="text-black/45 text-[12.5px]">Welcome back,</p>
      <h1 className="font-display text-[22px] font-bold -mt-0.5">{actor?.name || "Admin"}</h1>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <StatCard label="Total Users" value={stats.totalUsers} Icon={Users2} />
        <StatCard label="Active Workers" value={stats.approvedWorkers} Icon={HardHat} />
        <StatCard label="KYC Pending" value={stats.pendingWorkers} Icon={Clock3} warn onClick={() => navigate("/admin/workers")} />
        <StatCard label="Bookings Pending" value={stats.pendingBookings} Icon={CalendarCheck} warn onClick={() => navigate("/admin/bookings")} />
      </div>

      <div className="mt-3 bg-white border border-black/10 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center text-[var(--color-gold-deep)]">
            <IndianRupee size={16} />
          </div>
          <div>
            <p className="text-[11px] text-black/40">Revenue this month</p>
            <p className="font-display font-bold text-[20px]">₹{stats.revenueThisMonth.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      {/* KYC queue */}
      {pendingWorkers.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => navigate("/admin/workers")}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="font-display font-bold text-[15px]">KYC Reviews</h2>
            <span className="flex items-center gap-0.5 text-[12.5px] font-medium text-[var(--color-gold-deep)]">
              View all <ChevronRight size={14} />
            </span>
          </button>
          <div className="flex flex-col gap-2.5">
            {pendingWorkers.map((w) => (
              <div key={w._id} className="flex items-center justify-between bg-white border border-black/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium">{w.name}</p>
                  <p className="text-[11px] text-black/40 mt-0.5">{w.skills.join(", ")}</p>
                </div>
                <span className="text-[10.5px] font-semibold bg-[var(--color-warn)]/15 text-[var(--color-gold-deep)] px-2.5 py-1 rounded-full">
                  KYC Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking queue */}
      {pendingBookings.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => navigate("/admin/bookings")}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="font-display font-bold text-[15px]">Booking Requests</h2>
            <span className="flex items-center gap-0.5 text-[12.5px] font-medium text-[var(--color-gold-deep)]">
              View all <ChevronRight size={14} />
            </span>
          </button>
          <div className="flex flex-col gap-2.5">
            {pendingBookings.map((b) => (
              <div key={b._id} className="flex items-center justify-between bg-white border border-black/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium">{b.serviceTitle}</p>
                  <p className="text-[11px] text-black/40 mt-0.5">{b.user?.name} → {b.workerName}</p>
                </div>
                <span className="text-[10.5px] font-semibold bg-[var(--color-warn)]/15 text-[var(--color-gold-deep)] px-2.5 py-1 rounded-full">
                  Needs action
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, Icon, warn, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white border border-black/10 rounded-2xl p-4 text-left ${onClick ? "active:scale-[0.97] transition-transform" : ""}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
        warn ? "bg-[var(--color-warn)]/15 text-[var(--color-gold-deep)]" : "bg-[var(--color-ink)]/5 text-[var(--color-ink)]"
      }`}>
        <Icon size={16} />
      </div>
      <p className="font-display font-bold text-[20px] mt-3">{value}</p>
      <p className="text-[11px] text-black/45 mt-0.5">{label}</p>
    </button>
  );
}
