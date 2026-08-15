import { Outlet } from "react-router-dom";
import { Briefcase, Wallet, UserRound, LayoutGrid } from "lucide-react";
import BottomNav from "../shared/BottomNav.jsx";
import SessionExpiredBanner from "../shared/SessionExpiredBanner.jsx";

const TABS = [
  { to: "/worker", label: "Jobs", Icon: Briefcase },
  { to: "/worker/schedule", label: "Schedule", Icon: LayoutGrid },
  { to: "/worker/earnings", label: "Earnings", Icon: Wallet },
  { to: "/worker/profile", label: "Profile", Icon: UserRound },
];

export default function WorkerShell() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] pb-24">
      <SessionExpiredBanner loginPath="/login/worker" />
      <Outlet />
      <BottomNav tabs={TABS} />
    </div>
  );
}
