import { Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, UserCheck, CalendarCheck, Users2, LogOut, ShieldCheck, LayoutGrid } from "lucide-react";
import BottomNav from "../shared/BottomNav.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const TABS = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/catalog", label: "Catalog", Icon: LayoutGrid },
  { to: "/admin/bookings", label: "Bookings", Icon: CalendarCheck },
  { to: "/admin/workers", label: "KYC Review", Icon: UserCheck },
  { to: "/admin/users", label: "Users", Icon: Users2 },
];

export default function AdminShell() {
  const { actor, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] pb-24">
      <div className="sticky top-0 z-30 bg-[var(--color-ink)] px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
            <ShieldCheck size={15} className="text-[var(--color-gold)]" />
          </div>
          <div>
            <p className="text-white/45 text-[10.5px] uppercase tracking-widest leading-none">Admin</p>
            <p className="text-white font-display font-bold text-[14px] leading-tight mt-0.5">{actor?.name || "Admin"}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 bg-white/10 text-white/80 font-medium text-[12px] rounded-xl px-3 py-2 active:scale-95 transition-transform">
          <LogOut size={14} /> Logout
        </button>
      </div>
      <Outlet />
      <BottomNav tabs={TABS} />
    </div>
  );
}
