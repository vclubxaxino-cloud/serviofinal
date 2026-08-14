import crypto from "crypto";
import User from "../models/User.js";
import Worker from "../models/Worker.js";
import Admin from "../models/Admin.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../utils/token.js";
import { sendPasswordResetEmail } from "../utils/mailer.js";

const MODELS = { user: User, worker: Worker, admin: Admin };

const publicShape = (actor, role) => ({
  id: actor._id,
  name: actor.name,
  email: actor.email,
  role,
  createdAt: actor.createdAt,
  ...(role === "worker" ? { kycStatus: actor.kycStatus } : {}),
});

// ── Register: user or worker only (admins are seeded manually) ──────────────
export const register = async (req, res) => {
  const { role } = req.params;
  if (role === "admin") {
    return res.status(403).json({ message: "Admin accounts cannot be created via signup." });
  }
  const Model = MODELS[role];
  if (!Model) return res.status(400).json({ message: "Invalid role." });

  try {
    const existing = await Model.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });

    let actor;
    if (role === "worker") {
      const { name, email, phone, password, skills, serviceAreas, aadhaarNumber, kycDocType } = req.body;

      const aadhaarFile = req.files?.aadhaarFile?.[0];
      const secondaryFile = req.files?.kycFile?.[0];

      actor = await Worker.create({
        name,
        email,
        phone,
        password,
        skills: Array.isArray(skills) ? skills : String(skills || "").split(",").map(s => s.trim()).filter(Boolean),
        serviceAreas: Array.isArray(serviceAreas)
          ? serviceAreas
          : String(serviceAreas || "").split(",").map(s => s.trim()).filter(Boolean),
        aadhaarNumber,
        kycDocType,
        kycStatus: "pending",
        kycDocuments: {
          aadhaarFileUrl: aadhaarFile ? aadhaarFile.path : undefined,   // Cloudinary secure URL
          secondaryFileUrl: secondaryFile ? secondaryFile.path : undefined,
        },
      });
    } else {
      const { name, email, phone, password } = req.body;
      actor = await User.create({ name, email, phone, password });
    }

    const token = signToken(actor._id, role);
    setAuthCookie(res, token);
    res.status(201).json({ actor: publicShape(actor, role) });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(err.errors)[0]?.message || "Invalid data." });
    }
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// ── Login: shared across all 3 roles ────────────────────────────────────────
export const login = async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;
  const Model = MODELS[role];
  if (!Model) return res.status(400).json({ message: "Invalid role." });

  try {
    const actor = await Model.findOne({ email }).select("+password");
    if (!actor) return res.status(401).json({ message: "Invalid email or password." });

    const match = await actor.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid email or password." });

    if (role === "worker" && actor.kycStatus !== "approved") {
      // Still let them log in, but the frontend should route them to a
      // "pending approval" screen — kycStatus is included in the response.
    }

    const token = signToken(actor._id, role);
    setAuthCookie(res, token);
    res.json({ actor: publicShape(actor, role) });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out." });
};

// ── Me: restore session on frontend refresh ─────────────────────────────────
export const me = async (req, res) => {
  const Model = MODELS[req.actor.role];
  const actor = await Model.findById(req.actor.id);
  if (!actor) return res.status(404).json({ message: "Account not found." });
  res.json({ actor: publicShape(actor, req.actor.role) });
};

// ── Forgot password: send a reset link ──────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { role } = req.params;
  const { email } = req.body;
  const Model = MODELS[role];
  if (!Model) return res.status(400).json({ message: "Invalid role." });

  // Always respond the same way whether or not the account exists —
  // this avoids leaking which emails are registered.
  const genericResponse = { message: "If an account exists for that email, a reset link has been sent." };

  try {
    const actor = await Model.findOne({ email });
    if (!actor) return res.json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString("hex");
    actor.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    actor.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await actor.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5174";
    const resetUrl = `${clientUrl}/reset-password/${role}/${rawToken}`;
    sendPasswordResetEmail(actor, resetUrl);

    res.json(genericResponse);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// ── Reset password: consume the token, set a new password ──────────────────
export const resetPassword = async (req, res) => {
  const { role, token } = req.params;
  const { password } = req.body;
  const Model = MODELS[role];
  if (!Model) return res.status(400).json({ message: "Invalid role." });

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const actor = await Model.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!actor) {
      return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
    }

    actor.password = password; // pre-save hook hashes this
    actor.resetPasswordToken = undefined;
    actor.resetPasswordExpires = undefined;
    await actor.save();

    // Log them in immediately after a successful reset
    const jwtToken = signToken(actor._id, role);
    setAuthCookie(res, jwtToken);
    res.json({ actor: publicShape(actor, role), message: "Password updated." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};
