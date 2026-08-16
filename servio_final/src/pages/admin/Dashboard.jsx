import { useState, useEffect } from "react";
import { Users2, HardHat, Clock3, IndianRupee, CalendarCheck, ChevronRight, Wifi, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Dashboard() {
  const { actor } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [onlinePartners, setOnlinePartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, workersRes, bookingsRes, approvedRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/workers/pending"),
          api.get("/bookings/admin?status=pending_admin"),
          api.get("/workers/approved"),
        ]);
        setStats(statsRes.stats);
        setPendingWorkers(workersRes.workers);
        setPendingBookings(bookingsRes.bookings);
        setOnlinePartners(approvedRes.workers.filter((w) => w.isOnline));
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
        <StatCard label="Online Now" value={stats.onlineWorkers} Icon={Wifi} online onClick={() => navigate("/admin/workers")} />
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

      {/* Live partners — who's online right now, ready to be assigned */}
      <div className="mt-6">
        <div className="flex items-center justify-between w-full mb-3">
          <h2 className="font-display font-bold text-[15px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-ok)] animate-pulse" />
            Live Partners
          </h2>
          <span className="text-[11.5px] font-medium text-black/35">{onlinePartners.length} online</span>
        </div>
        {onlinePartners.length === 0 ? (
          <div className="bg-white border border-black/10 rounded-2xl px-4 py-5 text-center">
            <p className="text-[12.5px] text-black/40">No partners online right now.</p>
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 rail">
            {onlinePartners.map((w) => (
              <div key={w._id} className="shrink-0 w-[136px] bg-white border border-black/10 rounded-2xl p-3.5">
                <div className="relative w-10 h-10">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-display font-bold text-[var(--color-gold)] text-[14px]">
                    {w.name[0]}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-ok)] border-2 border-white" />
                </div>
                <p className="text-[12.5px] font-semibold mt-2 truncate">{w.name}</p>
                <p className="text-[10.5px] text-black/40 truncate">{w.skills?.[0] || "—"}</p>
                <div className="flex items-center gap-0.5 mt-1.5 text-[10.5px] text-black/45">
                  <Star size={9} className="text-[var(--color-gold)] fill-[var(--color-gold)]" /> {w.rating ?? "—"}
                </div>
              </div>
            ))}
          </div>
        )}
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

function StatCard({ label, value, Icon, warn, online, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white border border-black/10 rounded-2xl p-4 text-left ${onClick ? "active:scale-[0.97] transition-transform" : ""}`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
        online ? "bg-[var(--color-ok)]/15 text-[var(--color-ok)]" :
        warn ? "bg-[var(--color-warn)]/15 text-[var(--color-gold-deep)]" : "bg-[var(--color-ink)]/5 text-[var(--color-ink)]"
      }`}>
        <Icon size={16} />
      </div>
      <p className="font-display font-bold text-[20px] mt-3 flex items-center gap-1.5">
        {value}
        {online && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ok)] animate-pulse" />}
      </p>
      <p className="text-[11px] text-black/45 mt-0.5">{label}</p>
    </button>
  );
}
