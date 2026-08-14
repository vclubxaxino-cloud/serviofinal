import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Mail, CheckCircle2 } from "lucide-react";
import { api } from "../../api/client.js";

const COPY = {
  user:   { title: "Reset your password", color: "text-[var(--color-gold-deep)]" },
  worker: { title: "Reset partner password", color: "text-[var(--color-ok)]" },
  admin:  { title: "Reset admin password", color: "text-[var(--color-danger)]" },
};

export default function ForgotPassword() {
  const { role } = useParams();
  const navigate = useNavigate();
  const copy = COPY[role] || COPY.user;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post(`/auth/forgot-password/${role}`, { email });
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-ok)]/10 flex items-center justify-center mb-5">
          <CheckCircle2 size={28} className="text-[var(--color-ok)]" />
        </div>
        <h1 className="font-display text-[22px] font-bold">Check your email</h1>
        <p className="text-black/45 text-[14px] mt-2 max-w-xs leading-relaxed">
          If an account exists for <span className="font-medium text-black/70">{email}</span>, we've sent
          a link to reset your password. It expires in 1 hour.
        </p>
        <Link to={`/login/${role}`}
          className="mt-6 bg-[var(--color-ink)] text-white font-semibold rounded-xl px-6 py-3.5 text-[14px]">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col px-6 pt-12 pb-10">
      <button onClick={() => navigate(`/login/${role}`)}
        className="w-9 h-9 rounded-full bg-black/6 flex items-center justify-center mb-8 active:scale-90 transition-transform">
        <ArrowLeft size={16} />
      </button>

      <div className="mb-8">
        <p className={`text-[12px] font-semibold uppercase tracking-widest mb-1 ${copy.color}`}>{role}</p>
        <h1 className="font-display text-[26px] font-bold">{copy.title}</h1>
        <p className="text-black/45 text-[14px] mt-1">Enter your email and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-black/55">Email address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full rounded-xl border bg-white pl-11 pr-4 py-3.5 text-[15px] outline-none transition-colors ${
                error ? "border-[var(--color-danger)]" : "border-black/10 focus:border-[var(--color-gold)]"
              }`}
            />
          </div>
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
              Sending…
            </>
          ) : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
