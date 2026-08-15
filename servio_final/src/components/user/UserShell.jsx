import { Outlet } from "react-router-dom";
import { Home, Grid3x3, CalendarCheck, UserRound } from "lucide-react";
import BottomNav from "../shared/BottomNav.jsx";
import WhatsAppButton from "../shared/WhatsAppButton.jsx";
import SessionExpiredBanner from "../shared/SessionExpiredBanner.jsx";

const TABS = [
  { to: "/user", label: "Home", Icon: Home },
  { to: "/user/services", label: "Services", Icon: Grid3x3 },
  { to: "/user/bookings", label: "Bookings", Icon: CalendarCheck },
  { to: "/user/profile", label: "Profile", Icon: UserRound },
];

export default function UserShell() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] pb-24">
      <SessionExpiredBanner loginPath="/login/user" />
      <Outlet />
      <WhatsAppButton />
      <BottomNav tabs={TABS} />
    </div>
  );
}
