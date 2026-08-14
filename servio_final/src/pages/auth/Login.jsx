import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { resumePendingBooking } from "../../utils/pendingBooking.js";

const COPY = {
  user:   { title: "Welcome back", sub: "Login to book your next service", cta: "Log in", color: "text-[var(--color-gold-deep)]" },
  worker: { title: "Partner login", sub: "Access your jobs & earnings", cta: "Log in", color: "text-[var(--color-ok)]" },
  admin:  { title: "Admin console", sub: "Restricted access — authorised personnel only", cta: "Enter console", color: "text-[var(--color-danger)]" },
};

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const copy = COPY[role] || COPY.user;

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password are required."); return; }
    setError("");
    setLoading(true);
    try {
      const { actor: loggedIn } = await login(role, { email, password });
      if (role === "worker" && loggedIn.kycStatus !== "approved") {
        navigate("/worker/pending");
        return;
      }
      const booked = await resumePendingBooking(role);
      navigate(booked ? "/user/bookings" : `/${role}`);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col px-6 pt-12 pb-10">
      <Link to="/" className="w-9 h-9 rounded-full bg-black/6 flex items-center justify-center mb-8 active:scale-90 transition-transform">
        <ArrowLeft size={16} />
      </Link>

      <div className="mb-8">
        <p className={`text-[12px] font-semibold uppercase tracking-widest mb-1 ${copy.color}`}>
          {role} login
        </p>
        <h1 className="font-display text-[28px] font-bold">{copy.title}</h1>
        <p className="text-black/45 text-[14px] mt-1">{copy.sub}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-black/55">Email address</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`rounded-xl border bg-white px-4 py-3.5 text-[15px] outline-none transition-colors ${
              error ? "border-[var(--color-danger)]" : "border-black/10 focus:border-[var(--color-gold)]"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12.5px] font-medium text-black/55">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl border bg-white px-4 py-3.5 pr-12 text-[15px] outline-none transition-colors ${
                error ? "border-[var(--color-danger)]" : "border-black/10 focus:border-[var(--color-gold)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Link to={`/forgot-password/${role}`} className="text-[12.5px] text-[var(--color-gold-deep)] font-semibold text-right -mt-2">
          Forgot password?
        </Link>

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
              Please wait…
            </>
          ) : copy.cta}
        </button>
      </form>

      {role !== "admin" && (
        <p className="text-center text-[13px] text-black/45 mt-6">
          New here?{" "}
          <Link to={`/signup/${role}`} className="text-[var(--color-gold-deep)] font-semibold">
            Create an account
          </Link>
        </p>
      )}

    </div>
  );
}
