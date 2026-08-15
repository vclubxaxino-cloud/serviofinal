import jwt from "jsonwebtoken";

export const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Cross-site cookies (frontend and backend on different domains, as in
// production) need sameSite:"none" + secure:true to be sent at all by any
// modern browser. `partitioned` is added on top of that for Safari/iOS —
// without it, Safari's Intelligent Tracking Prevention can silently drop
// or refuse to store a cross-site cookie even when sameSite/secure are
// correct, which is what causes "login works, but the very next request
// says not authenticated" specifically on iPhone.
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  ...(process.env.NODE_ENV === "production" ? { partitioned: true } : {}),
});

export const setAuthCookie = (res, token) => {
  res.cookie("servio_token", token, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookie = (res) => {
  // clearCookie only removes a cookie if these attributes match the ones
  // it was set with — must mirror setAuthCookie exactly, or the cookie
  // silently survives logout on some browsers.
  res.clearCookie("servio_token", cookieOptions());
};
