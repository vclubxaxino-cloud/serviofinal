import { Bell, CheckCircle2, Clock, XCircle, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { STATUS_LABEL } from "../../constants/bookingStatus.js";

const STATUS_ICON = {
  pending_admin: Clock,
  assigned: CheckCircle2,
  in_progress: CheckCircle2,
  completed: CheckCircle2,
  rejected: XCircle,
};

const STATUS_MESSAGE = {
  pending_admin: "is awaiting admin confirmation",
  assigned: "has been assigned a verified partner",
  in_progress: "is in progress",
  completed: "was completed",
  rejected: "could not be confirmed for the requested slot",
};

export default function NotificationPanel({ bookings, loggedIn, onClose }) {
  const navigate = useNavigate();
  // Most recently updated bookings first — a simple stand-in for real push
  // notifications until an SMS/email/push system is wired up.
  const recent = [...bookings]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative mt-16 mr-4 w-[calc(100%-32px)] max-w-sm bg-white rounded-2xl shadow-xl border border-black/8 overflow-hidden page-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3.5 border-b border-black/8 flex items-center gap-2">
          <Bell size={15} className="text-[var(--color-gold-deep)]" />
          <p className="font-display font-bold text-[14px]">Notifications</p>
        </div>

        {!loggedIn ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] text-black/45">Log in to see updates on your bookings here.</p>
            <button
              onClick={() => navigate("/login/user")}
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--color-gold-deep)]"
            >
              <LogIn size={13} /> Log in
            </button>
          </div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] text-black/40">No updates yet — book a service to see status updates here.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {recent.map((b) => {
              const Icon = STATUS_ICON[b.status] || Clock;
              return (
                <button
                  key={b._id}
                  onClick={() => { onClose(); navigate("/user/bookings"); }}
                  className="w-full flex items-start gap-3 px-4 py-3 border-b border-black/5 last:border-0 text-left active:bg-black/2"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--color-gold)]/12 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} className="text-[var(--color-gold-deep)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] leading-snug">
                      <span className="font-semibold">{b.serviceTitle}</span> {STATUS_MESSAGE[b.status] || STATUS_LABEL[b.status]}
                    </p>
                    <p className="text-[10.5px] text-black/35 mt-0.5">
                      {new Date(b.updatedAt || b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
