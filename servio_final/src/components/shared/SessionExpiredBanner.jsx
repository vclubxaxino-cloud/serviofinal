import { useNavigate } from "react-router-dom";
import { AlertCircle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function SessionExpiredBanner({ loginPath }) {
  const { sessionExpired, clearSessionExpiredFlag } = useAuth();
  const navigate = useNavigate();

  if (!sessionExpired) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2.5">
      <AlertCircle size={15} className="text-amber-600 shrink-0" />
      <p className="text-[12px] text-amber-800 flex-1">
        Your session expired — please log in again to continue.
      </p>
      <button
        onClick={() => { clearSessionExpiredFlag(); navigate(loginPath); }}
        className="text-[12px] font-semibold text-amber-800 underline shrink-0"
      >
        Log in
      </button>
      <button onClick={clearSessionExpiredFlag} className="text-amber-600 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
