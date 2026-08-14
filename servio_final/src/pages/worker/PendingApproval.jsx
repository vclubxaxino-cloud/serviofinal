import { useNavigate } from "react-router-dom";
import { Clock3, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const STEPS = [
  { label: "Documents submitted",    done: true,  Icon: FileText },
  { label: "KYC under review",       done: false, Icon: Clock3 },
  { label: "Admin approval pending", done: false, Icon: ShieldCheck },
  { label: "Account activated",      done: false, Icon: CheckCircle2 },
];

export default function PendingApproval() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--color-ink)] flex flex-col items-center justify-center px-8 text-center">
      {/* Pulsing clock icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center animate-pulse">
            <Clock3 size={28} className="text-[var(--color-gold)]" />
          </div>
        </div>
      </div>

      <h1 className="font-display text-[22px] font-bold text-white">Application under review</h1>
      <p className="text-white/45 text-[14px] mt-2.5 max-w-xs leading-relaxed">
        Our team is going through your Aadhaar and KYC documents. This usually takes under 24 hours.
      </p>

      {/* Progress steps */}
      <div className="w-full max-w-xs mt-8 flex flex-col gap-3">
        {STEPS.map(({ label, done, Icon }, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              done ? "bg-[var(--color-gold)]" : i === 1 ? "bg-white/10 ring-2 ring-[var(--color-gold)]/50" : "bg-white/5"
            }`}>
              <Icon size={15} className={done ? "text-[var(--color-ink)]" : "text-white/40"} />
            </div>
            <p className={`text-[13px] text-left ${done ? "text-white font-medium" : i === 1 ? "text-[var(--color-gold)]" : "text-white/30"}`}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-10 w-full max-w-xs">
        <button
          onClick={() => navigate("/")}
          className="text-[var(--color-gold)] font-semibold text-[14px] border border-[var(--color-gold)]/30 rounded-xl px-6 py-3 active:scale-95 transition-transform"
        >
          Back to home
        </button>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="text-white/30 text-[13px]"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
