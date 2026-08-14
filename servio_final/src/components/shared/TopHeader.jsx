import { useState } from "react";
import { Bell, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationPanel from "./NotificationPanel.jsx";

export default function TopHeader({ city = "Bhilai", bookings = [] }) {
  const { actor, role } = useAuth();
  const [showPanel, setShowPanel] = useState(false);
  const unseenCount = bookings.filter(b => b.status !== "pending_admin").length;

  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)] flex items-center justify-center font-display font-bold text-[var(--color-ink)] text-sm shrink-0">
          S
        </div>
        <div className="leading-tight">
          <p className="font-display font-bold text-[15px] text-[var(--color-ink)]">Servio</p>
          <div className="flex items-center gap-1 -mt-0.5">
            <MapPin size={10} className="text-black/35" />
            <p className="text-[10.5px] text-black/40">{city}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actor?.name && (
          <p className="text-[12px] text-black/45 font-medium">Hey, {actor.name.split(" ")[0]}</p>
        )}
        <button
          onClick={() => setShowPanel(true)}
          aria-label="Notifications"
          className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center relative active:scale-95 transition-transform"
        >
          <Bell size={16} strokeWidth={2} />
          {unseenCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--color-danger)] text-white text-[8px] font-bold flex items-center justify-center">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </button>
      </div>

      {showPanel && (
        <NotificationPanel
          bookings={bookings}
          loggedIn={role === "user"}
          onClose={() => setShowPanel(false)}
        />
      )}
    </header>
  );
}
