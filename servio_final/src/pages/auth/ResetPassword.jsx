import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ResetPassword() {
  const { role, token } = useParams();
  const navigate = useNavigate();
  const { setActorFromReset } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    setError("");
    setLoading(true);
    try {
      const { actor } = await api.post(`/auth/reset-password/${role}/${token}`, { password });
      setActorFromReset(role, actor);
      setDone(true);
      setTimeout(() => navigate(`/${role}`), 1500);
    } catch (err) {
      setError(err.message || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-ok)]/10 flex items-center justify-center mb-5">
          <CheckCircle2 size={28} className="text-[var(--color-ok)]" />
        </div>
        <h1 className="font-display text-[22px] font-bold">Password updated!</h1>
        <p className="text-black/45 text-[14px] mt-2">Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col px-6 pt-12 pb-10">
      <Link to={`/login/${role}`} className="w-9 h-9 rounded-full bg-black/6 flex items-center justify-center mb-8 active:scale-90 transition-transform">
        <ArrowLeft size={16} />
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-[26px] font-bold">Set a new password</h1>
        <p className="text-black/45 text-[14px] mt-1">Choose a password you haven't used before.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-black/55">New password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-12 text-[15px] outline-none transition-colors ${
                error ? "border-[var(--color-danger)]" : "border-black/10 focus:border-[var(--color-gold)]"
              }`}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-black/55">Confirm new password</label>
          <input
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] outline-none transition-colors ${
              error ? "border-[var(--color-danger)]" : "border-black/10 focus:border-[var(--color-gold)]"
            }`}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[var(--color-danger)] text-[13px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-4 text-[15px] active:scale-[0.98] transition-transform disabled:opacity-55 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating…
            </>
          ) : "Update password"}
        </button>
      </form>
    </div>
  );
}
