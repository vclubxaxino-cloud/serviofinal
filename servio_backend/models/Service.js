import mongoose from "mongoose";

// A single pricing tier within a service (Basic / Standard / Premium etc.)
const packageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },       // e.g. "basic", "standard", "premium"
    label: { type: String, required: true },     // e.g. "Standard"
    price: { type: Number, required: true },
    originalPrice: { type: Number },              // for showing strike-through discounts
    desc: { type: String, required: true },
    includes: { type: [String], default: undefined }, // used by bundle/package services
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    subCategory: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true },

    isPackage: { type: Boolean, default: false },  // true = multi-item bundle (e.g. wedding packages)
    isEnquiry: { type: Boolean, default: false },   // true = "get a quote" custom service, no fixed price

    packages: { type: [packageSchema], required: true },

    isActive: { type: Boolean, default: true },     // lets admin hide a service without deleting it
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
