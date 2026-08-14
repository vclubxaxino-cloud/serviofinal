import Category from "../models/Category.js";
import Service from "../models/Service.js";

export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ categories });
};

// GET /api/services?category=<id>
export const getServices = async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  const services = await Service.find(filter).populate("category", "name slug icon");
  res.json({ services });
};

export const getServiceById = async (req, res) => {
  const service = await Service.findById(req.params.id).populate("category", "name slug icon");
  if (!service) return res.status(404).json({ message: "Service not found." });
  res.json({ service });
};

// ── Admin: catalog management ────────────────────────────────────────────────
export const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ service });
  } catch (err) {
    res.status(400).json({ message: err.message || "Could not create service." });
  }
};

export const updateService = async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) return res.status(404).json({ message: "Service not found." });
  res.json({ service });
};

export const toggleServiceActive = async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ message: "Service not found." });
  service.isActive = !service.isActive;
  await service.save();
  res.json({ service });
};
