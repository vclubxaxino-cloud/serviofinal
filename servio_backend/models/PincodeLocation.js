import mongoose from "mongoose";

// Caches the result of resolving an Indian PIN code to an approximate
// lat/long, so we only ever call the external lookup services once per
// pincode — every booking/worker-search after that reads straight from
// MongoDB, which is instant and has no rate limit.
const pincodeLocationSchema = new mongoose.Schema(
  {
    pincode: { type: String, required: true, unique: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    district: { type: String },
    state: { type: String },
    // "resolved" once we successfully geocoded it. "failed" means we tried
    // and couldn't find coordinates — cached too, so we don't keep retrying
    // an invalid/unrecognised pincode on every request.
    status: { type: String, enum: ["resolved", "failed"], default: "resolved" },
  },
  { timestamps: true }
);

export default mongoose.model("PincodeLocation", pincodeLocationSchema);