import rateLimit from "express-rate-limit";

// Strict limit for login/signup — prevents brute-force password guessing
// and signup spam. 10 attempts per 15 minutes per IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

// Looser limit for creating bookings — stops someone from spamming the
// booking form, while not annoying a genuine customer. 20 per 15 minutes.
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many booking requests. Please slow down and try again shortly." },
});

// General-purpose limiter for the whole API as a safety net — generous,
// just to stop a runaway script from hammering the server. 300 per 15 min.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again shortly." },
});
