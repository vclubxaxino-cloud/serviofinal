import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, default: "video" }, // matches lucide icon keys used on frontend
    displayOrder: { type: Number, default: 0 }, // controls the order shown on the homepage
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
