import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, setSessionExpiredHandler } from "../api/client.js";

const AuthContext = createContext(null);
const ROLE_KEY = "servio_role"; // only used to remember which role to check on refresh

export function AuthProvider({ children }) {
  const [actor, setActor] = useState(null);
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || null);
  const [ready, setReady] = useState(false); // true once we've checked for an existing session
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ROLE_KEY);
    setActor(null);
    setRole(null);
  }, []);

  // If any API call comes back 401 while the app thinks someone is logged
  // in, the session cookie has gone stale (this happens on iPhone Safari
  // in particular — Intelligent Tracking Prevention can silently drop it).
  // Clear local state and flag it so the UI can explain what happened,
  // rather than just showing a confusing "please log in" on one action.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearSession();
      setSessionExpired(true);
    });
  }, [clearSession]);

  // On first load, if we previously logged in as some role, ask the backend
  // if that session (httpOnly cookie) is still valid.
  useEffect(() => {
    const restore = async () => {
      if (!role) { setReady(true); return; }
      try {
        const { actor: me } = await api.get("/auth/me");
        setActor(me);
      } catch {
        clearSession();
      } finally {
        setReady(true);
      }
    };
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (roleName, credentials) => {
    const { actor: loggedIn } = await api.post(`/auth/login/${roleName}`, {
      email: credentials.email,
      password: credentials.password,
    });
    localStorage.setItem(ROLE_KEY, roleName);
    setActor(loggedIn);
    setRole(roleName);
    setSessionExpired(false);
    return { actor: loggedIn };
  }, []);

  // Full registration (used by Signup.jsx) — separate from login because
  // sign-up needs extra fields (phone, password, skills, KYC docs for workers).
  const register = useCallback(async (roleName, formData) => {
    const { actor: created } = await api.post(`/auth/register/${roleName}`, formData);
    localStorage.setItem(ROLE_KEY, roleName);
    setActor(created);
    setRole(roleName);
    setSessionExpired(false);
    return { actor: created };
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore network errors on logout */ }
    clearSession();
    setSessionExpired(false);
  }, [clearSession]);

  // After a successful password reset, the backend already set the login
  // cookie — this just syncs the frontend's in-memory state to match.
  const setActorFromReset = useCallback((roleName, resetActor) => {
    localStorage.setItem(ROLE_KEY, roleName);
    setActor(resetActor);
    setRole(roleName);
    setSessionExpired(false);
  }, []);

  return (
    <AuthContext.Provider value={{ actor, role, ready, login, register, logout, setActorFromReset, sessionExpired, clearSessionExpiredFlag: () => setSessionExpired(false) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
