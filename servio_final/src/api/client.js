// Thin fetch wrapper around the Servio backend.
// Auth uses an httpOnly cookie (set by the backend on login/register),
// so every request sends credentials — no token to manage on the client.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// For static files served outside /api (e.g. /uploads/kyc/...)
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

// Set by AuthContext on mount. If a request comes back 401 after the app
// already thinks the person is logged in, this clears that stale state —
// this happens on iPhone Safari in particular, which can silently drop
// the session cookie (Intelligent Tracking Prevention) while the app's
// in-memory state still shows the person as logged in.
let onSessionExpired = null;
export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

async function request(path, { method = "GET", body } = {}) {
  const isFormData = body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    // For FormData, don't set Content-Type — the browser sets it with
    // the correct multipart boundary automatically.
    headers: body && !isFormData ? { "Content-Type": "application/json" } : undefined,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && path !== "/auth/me" && onSessionExpired) {
    onSessionExpired();
  }

  if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
};
