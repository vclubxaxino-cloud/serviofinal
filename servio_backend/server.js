import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { generalLimiter } from "./middleware/rateLimit.middleware.js";
import dns from "dns";
dns.setServers(['1.1.1.1', '1.0.0.1']);
import authRoutes from "./routes/auth.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
connectDB();

const app = express();

// Render (and most hosting platforms) sit behind a reverse proxy, which
// adds an X-Forwarded-For header with the real client IP. Without this,
// express-rate-limit can't trust that header and throws/misbehaves.
// `1` means trust exactly one hop of proxy (Render's own), not an
// arbitrary chain — safer than `true`, which would trust any proxy.
app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5174",
    credentials: true,
  })
);
app.use("/api", generalLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Servio backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servio backend running on port ${PORT}`);
});