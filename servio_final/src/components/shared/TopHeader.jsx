import { useState, useEffect } from "react";
import { Bell, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationPanel from "./NotificationPanel.jsx";
import { nearestKnownLocality } from "../../utils/localities.js";
import Logo from "../../assets/Logo.jpeg"

export default function TopHeader({ bookings = [] }) {
  const { actor, role } = useAuth();
  const [showPanel, setShowPanel] = useState(false);
  const [city, setCity] = useState("");
  const unseenCount = bookings.filter(b => b.status !== "pending_admin").length;

  useEffect(() => {
    // Fresh GPS check every time this component mounts — no stale cached
    // city. maximumAge: 0 tells the BROWSER itself not to reuse an old
    // cached GPS fix — this forces a real, current reading instead of an
    // old one from a previous visit.
    if (!navigator.geolocation) {
      console.warn("[Servio] Geolocation not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // 1) Check our own known-localities table FIRST. OpenStreetMap's
        // free reverse-geocoder often collapses distinct twin-city areas
        // (e.g. Risali, which is its own town near Bhilai) into the nearest
        // big city name it recognises ("Durg"), because that's what its
        // underlying map data has tagged for that area. Our table lets us
        // override that with the actual nearest town/locality by straight-
        // line distance, for the places Servio actually serves.
        const known = nearestKnownLocality(latitude, longitude);
        if (known && known.distanceKm <= 8) {
          setCity(known.name);
          return;
        }

        // 2) Fall back to OpenStreetMap reverse geocoding for anywhere
        // outside our known-locality coverage.
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const detected =
            data?.address?.suburb || data?.address?.neighbourhood || data?.address?.quarter ||
            data?.address?.city_district || data?.address?.town || data?.address?.village ||
            data?.address?.city || data?.address?.county;
          if (detected) setCity(detected);
          else if (known) setCity(known.name); // better than nothing, even if a bit far
        } catch (err) {
          console.error("[Servio] Reverse geocoding failed:", err);
          if (known) setCity(known.name);
        }
      },
      () => { /* permission denied or unavailable — keep default, no error shown */ },
      { timeout: 8000, maximumAge: 0, enableHighAccuracy: true }
    );
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-5 pt-6 pb-3 bg-[var(--color-paper)]">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)] flex items-center justify-center font-display font-bold text-[var(--color-ink)] text-sm shrink-0">
          <img src={Logo} alt="SolutionWalaa Logo" srcset="" />
        </div>
        <div className="leading-tight">
          <p className="font-display font-bold text-[15px] text-[var(--color-ink)]">SolutionWalaa</p>
          <div className="flex items-center gap-1 -mt-0.5">
            <MapPin size={10} className="text-black/35" />
            <p className="text-[10.5px] text-black/40">{city || "Detecting location…"}</p>
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