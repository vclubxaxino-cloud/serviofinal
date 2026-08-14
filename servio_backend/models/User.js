import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, default: "user", enum: ["user"] },

    addresses: [{
      label: { type: String, required: true, trim: true },     // e.g. "Home", "Office"
      address: { type: String, required: true, trim: true },
      pincode: { type: String, trim: true },
      isDefault: { type: Boolean, default: false },
    }],

    notificationPrefs: {
      bookingUpdates: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
    },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
