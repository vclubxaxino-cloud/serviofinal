import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, default: "worker", enum: ["worker"] },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    skills: { type: [String], default: [] },
    serviceAreas: { type: [String], default: [] }, // pincodes
    pincode: { type: String },
    bio: { type: String, default: "" },

    rating: { type: Number, default: 0 },
    jobsDone: { type: Number, default: 0 },

    // Online/offline availability toggle — worker controls this from their app,
    // admin sees it live when assigning jobs.
    isOnline: { type: Boolean, default: false },
    lastOnlineAt: { type: Date },

    // KYC — worker cannot take jobs until admin approves
    kycStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    aadhaarNumber: { type: String },
    kycDocType: { type: String },
    kycDocuments: {
      aadhaarFileUrl: { type: String },  // e.g. /uploads/kyc/169...-aadhaar.jpg
      secondaryFileUrl: { type: String },
    },

    notificationPrefs: {
      jobAlerts: { type: Boolean, default: true },
      payoutUpdates: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

workerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

workerSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("Worker", workerSchema);
