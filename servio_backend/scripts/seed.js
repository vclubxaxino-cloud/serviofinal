// Run with: node scripts/seed.js
// Populates the database with starter categories, services, approved workers,
// and one admin account — so the app has real data to show on first run.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Service from "../models/Service.js";
import Worker from "../models/Worker.js";
import Admin from "../models/Admin.js";
import { categories, services, workers, adminSeed } from "./seedData.js";

dotenv.config();

const run = async () => {
  await connectDB();

  console.log("Clearing existing catalog + demo workers + admin...");
  await Promise.all([
    Category.deleteMany({}),
    Service.deleteMany({}),
    Worker.deleteMany({}),
    Admin.deleteMany({}),
  ]);

  console.log("Seeding categories...");
  const createdCategories = await Category.insertMany(categories);
  const slugToId = Object.fromEntries(createdCategories.map((c) => [c.slug, c._id]));

  console.log("Seeding services...");
  const serviceDocs = services.map(({ categorySlug, ...rest }) => ({
    ...rest,
    category: slugToId[categorySlug],
  }));
  await Service.insertMany(serviceDocs);

  console.log("Seeding workers (each save() so passwords get hashed)...");
  for (const w of workers) {
    await Worker.create(w);
  }

  console.log("Seeding admin account...");
  await Admin.create(adminSeed);

  console.log("\n✅ Seed complete.");
  console.log(`   Categories: ${createdCategories.length}`);
  console.log(`   Services:   ${serviceDocs.length}`);
  console.log(`   Workers:    ${workers.length}`);
  console.log(`   Admin login → email: ${adminSeed.email}  password: ${adminSeed.password}`);
  console.log("   (change the admin password after first login in production)\n");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
