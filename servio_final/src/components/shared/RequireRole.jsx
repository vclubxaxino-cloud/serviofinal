import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

// Guards a role's routes on the frontend. The real gate is always
// the backend (role.middleware.js) — this just avoids flashing a
// worker dashboard at someone who hasn't logged in as a worker.
export default function RequireRole({ role }) {
  const { role: activeRole, actor, ready } = useAuth();

  // Wait for the initial /auth/me check to finish (session restore on
  // page refresh) before deciding to redirect — otherwise a valid
  // logged-in user gets bounced to /login for a split second.
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-paper)]">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (activeRole !== role) {
    return <Navigate to={`/login/${role}`} replace />;
  }

  // A worker whose KYC isn't approved yet shouldn't reach the jobs
  // dashboard even if they navigate straight to /worker.
  if (role === "worker" && actor?.kycStatus && actor.kycStatus !== "approved") {
    return <Navigate to="/worker/pending" replace />;
  }

  return <Outlet />;
}
