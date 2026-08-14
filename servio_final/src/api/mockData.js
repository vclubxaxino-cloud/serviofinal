// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const mockCategories = [
  { _id: "c1", name: "Video Services", slug: "video", icon: "video" },
  { _id: "c2", name: "Medical Saathi", slug: "medical", icon: "heart-pulse" },
  { _id: "c3", name: "Yatra Saathi", slug: "yatra", icon: "map-pin" },
  { _id: "c4", name: "NRI Parent Care", slug: "nri", icon: "users" },
];

// ─── SERVICES ──────────────────────────────────────────────────────────────────
export const mockServices = [
  { _id: "v1", category: "c1", subCategory: "Car Delivery", title: "New Home Arrivals Reel", description: "A cinematic reel capturing the moment your new car is delivered home.", startingPrice: 1999, packages: [{ id: "basic", label: "Basic", price: 1999, desc: "1 reel · basic cuts & music sync" }, { id: "standard", label: "Standard", price: 3499, desc: "1 reel · cinematic transitions & colour grading" }, { id: "premium", label: "Premium", price: 4999, desc: "1 reel · premium cinematic edit & sound design" }] },
  { _id: "v2", category: "c1", subCategory: "Car Delivery", title: "Property Showcase Reel", description: "Showcase your property or vehicle delivery moment in a stunning reel.", startingPrice: 1499, packages: [{ id: "basic", label: "Basic", price: 1499, originalPrice: 1999, desc: "Basic showcase reel" }, { id: "standard", label: "Standard", price: 2499, originalPrice: 3499, desc: "Cinematic transitions + colour" }, { id: "premium", label: "Premium", price: 3999, originalPrice: 5499, desc: "Full premium edit" }] },
  { _id: "v3", category: "c1", subCategory: "Car Delivery", title: "Delivery Reels", description: "Dedicated edit for your car or product delivery moment.", startingPrice: 1500, packages: [{ id: "basic", label: "Basic", price: 1500, desc: "Basic cuts, music sync · 15–30 sec" }, { id: "standard", label: "Standard", price: 2500, desc: "Cinematic, colour grading, motion text · 30–45 sec" }, { id: "premium", label: "Premium", price: 3500, desc: "Premium edit, sound design, 2 revisions · 45–60 sec" }] },
  { _id: "v4", category: "c1", subCategory: "Car Delivery", title: "Birthday Reels", description: "Celebrate your birthday with your car or in style.", startingPrice: 599, packages: [{ id: "basic", label: "Basic", price: 599, originalPrice: 1499, desc: "Quick celebratory reel" }, { id: "standard", label: "Standard", price: 999, originalPrice: 2499, desc: "Cinematic + colour" }, { id: "premium", label: "Premium", price: 1499, originalPrice: 3999, desc: "Full premium birthday edit" }] },
  { _id: "v5", category: "c1", subCategory: "Family Function", title: "Engagement Reel", description: "A highlight reel of your engagement ceremony — every precious moment captured.", startingPrice: 599, packages: [{ id: "basic", label: "Basic", price: 599, originalPrice: 1499, desc: "1 reel (15–30 sec) · basic cuts, music, simple text" }, { id: "standard", label: "Standard", price: 1000, originalPrice: 2499, desc: "1 reel (30–45 sec) · cinematic, colour, motion text · 1 revision" }, { id: "premium", label: "Premium", price: 1500, originalPrice: 3999, desc: "1 reel (45–60 sec) · cinematic, sound design · 2 revisions" }] },
  { _id: "v6", category: "c1", subCategory: "Family Function", title: "Wedding Highlights Reel", description: "Relive your big day with a stunning cinematic highlights reel.", startingPrice: 899, packages: [{ id: "basic", label: "Basic", price: 899, desc: "1 highlight reel · music sync, basic transitions" }, { id: "standard", label: "Standard", price: 1199, desc: "Cinematic highlights, colour grading, motion text" }, { id: "premium", label: "Premium", price: 1500, desc: "Premium cinematic edit + storytelling, sound effects · 2 revisions" }] },
  { _id: "v7", category: "c1", subCategory: "Family Function", title: "Silver Wedding Package", description: "Complete 5-reel wedding coverage set.", startingPrice: 3999, isPackage: true, packages: [{ id: "silver", label: "Silver", price: 3999, desc: "5 reels total", includes: ["1 Pre-wedding Reel", "1 Haldi Reel", "1 Mehndi Reel", "1 Sangeet Reel", "Wedding Highlight Reel"] }] },
  { _id: "v8", category: "c1", subCategory: "Family Function", title: "Gold Wedding Package", description: "7 reels — a fuller wedding story.", startingPrice: 5999, isPackage: true, packages: [{ id: "gold", label: "Gold", price: 5999, desc: "7 reels total", includes: ["1 Pre-wedding Reel", "1 Engagement Reel", "1 Mehndi Reel", "1 Haldi Reel", "1 Sangeet Reel", "2 Wedding Reels"] }] },
  { _id: "v9", category: "c1", subCategory: "Family Function", title: "Platinum Wedding Package", description: "9 reels — complete wedding + family coverage.", startingPrice: 11999, isPackage: true, packages: [{ id: "platinum", label: "Platinum", price: 11999, desc: "9 reels total", includes: ["Pre-wedding", "Engagement", "Mehndi", "Haldi", "Sangeet", "Baraat", "Wedding Highlights", "Couple", "Family"] }] },
  { _id: "v10", category: "c1", subCategory: "Product Promotion", title: "Product Promotion Reel", description: "Business and commercial product promotion reels.", startingPrice: 499, packages: [{ id: "basic", label: "Basic", price: 499, originalPrice: 999, desc: "Basic product showcase" }, { id: "standard", label: "Standard", price: 999, originalPrice: 1499, desc: "Cinematic + motion text" }, { id: "premium", label: "Premium", price: 1799, originalPrice: 2499, desc: "Premium cinematic, advanced effects" }] },
  { _id: "v11", category: "c1", subCategory: "Product Promotion", title: "Shop / Café Reels", description: "Reels for shops, cafes & local businesses.", startingPrice: 699, packages: [{ id: "basic", label: "Basic", price: 699, originalPrice: 1499, desc: "Quick shop/café reel" }, { id: "standard", label: "Standard", price: 1299, originalPrice: 2499, desc: "Cinematic, colour + text" }, { id: "premium", label: "Premium", price: 2199, originalPrice: 3999, desc: "Premium brand reel" }] },
  { _id: "v12", category: "c1", subCategory: "Product Promotion", title: "Monthly Reel Packages", description: "Ongoing reel support for your business every month.", startingPrice: 2999, packages: [{ id: "starter", label: "Starter Business", price: 2999, desc: "4 reels / month" }, { id: "growth", label: "Growth Package", price: 4999, desc: "8 reels / month" }, { id: "premium", label: "Premium Package", price: 8999, desc: "12 reels / month" }] },
  { _id: "v13", category: "c1", subCategory: "Video Editing", title: "Long Video Editing", description: "Professional editing for 5–7 minute videos.", startingPrice: 399, packages: [{ id: "basic", label: "Basic", price: 399, desc: "Cuts & trimming, background music (basic)" }, { id: "standard", label: "Standard", price: 899, desc: "Cuts, text captions, B-roll, colour correction · 1 revision" }, { id: "premium", label: "Premium", price: 1299, desc: "Advanced edit, motion graphics, sound effects, thumbnail · 2 revisions" }] },
  { _id: "v14", category: "c1", subCategory: "Video Editing", title: "Podcast Editing", description: "Professional editing for 10–12 minute podcast episodes.", startingPrice: 599, packages: [{ id: "basic", label: "Basic", price: 599, desc: "Audio cleanup, basic cuts" }, { id: "standard", label: "Standard", price: 799, desc: "Multi-camera sync, audio enhancement, intro/outro" }, { id: "premium", label: "Premium", price: 1499, desc: "Full professional edit, motion graphics, shorts extraction" }] },
  { _id: "v15", category: "c1", subCategory: "Video Editing", title: "Monthly Content Packages", description: "Monthly long-form video editing plans for consistent creators.", startingPrice: 2999, packages: [{ id: "starter", label: "Starter", price: 2999, desc: "4 long videos / month (up to 10 min)" }, { id: "growth", label: "Growth", price: 4999, desc: "8 long videos / month · priority delivery" }, { id: "pro", label: "Pro", price: 6999, desc: "15 long videos / month · thumbnails · priority support" }] },
  { _id: "m1", category: "c2", subCategory: "Medical Saathi", title: "Medical Companion", description: "A trained companion who accompanies you or your parents to doctor visits, hospital admissions and discharge.", startingPrice: 500, packages: [{ id: "visit", label: "Per Visit", price: 500, desc: "₹500–800 / visit · doctor visit or hospital admission/discharge" }] },
  { _id: "m2", category: "c2", subCategory: "Medical Saathi", title: "Wellness Check Visit", description: "Regular weekly check-in visits for parents living alone — peace of mind for the whole family.", startingPrice: 2000, packages: [{ id: "monthly", label: "Monthly Plan", price: 2000, desc: "₹2,000–4,000 / month · weekly check-in visits" }] },
  { _id: "m3", category: "c2", subCategory: "Medical Saathi", title: "Mobility-Assisted Travel", description: "Wheelchair or walking-support companion for medical appointments.", startingPrice: 500, packages: [{ id: "assisted", label: "With Assistance", price: 500, desc: "+20% over base pricing · full mobility support included" }] },
  { _id: "y1", category: "c3", subCategory: "Yatra Saathi", title: "Local City Companion", description: "Same-city temple visit or half-day support with a trusted Saathi.", startingPrice: 800, packages: [{ id: "halfday", label: "Half Day", price: 800, desc: "₹800–1,500 / day · same-city temple or errand support" }] },
  { _id: "y2", category: "c3", subCategory: "Yatra Saathi", title: "Outstation Single-Day Trip", description: "Nearby city visit with a Saathi, returning the same day.", startingPrice: 1500, packages: [{ id: "outstation", label: "Single Day", price: 1500, desc: "₹1,500–2,500 / day + travel · nearby city, same-day return" }] },
  { _id: "y3", category: "c3", subCategory: "Yatra Saathi", title: "Multi-Day Pilgrimage", description: "Char Dham, Jyotirlinga, Vaishno Devi and other multi-day yatras with a dedicated Saathi.", startingPrice: 2000, packages: [{ id: "pilgrimage", label: "Per Day", price: 2000, desc: "₹2,000–3,000 / day + travel & stay · Char Dham, Jyotirlinga, Vaishno Devi etc." }] },
  { _id: "y4", category: "c3", subCategory: "Yatra Saathi", title: "Festival / Mela Assistance", description: "Safe guidance through high-crowd events like Kumbh Mela and Navratri.", startingPrice: 2500, packages: [{ id: "festival", label: "Per Day", price: 2500, desc: "₹2,500–3,500 / day · Kumbh Mela, Navratri, large festivals" }] },
  { _id: "n1", category: "c4", subCategory: "NRI Parent Care", title: "NRI Parent Care Package", description: "General care subscription for your parents back home — regular visits, updates, and emergency support when you can't be there.", startingPrice: 3000, packages: [{ id: "care", label: "Monthly", price: 3000, desc: "₹3,000–8,000 / month · visits, updates & emergency support" }] },
  { _id: "n2", category: "c4", subCategory: "NRI Parent Care", title: "Custom Care Plan", description: "Tell us your requirements and we'll design a care plan for your parents.", startingPrice: 0, isEnquiry: true, packages: [{ id: "enquiry", label: "Send Enquiry", price: 0, desc: "Fill a short form — we'll call back with a tailored plan" }] },
];

// ─── WORKERS ──────────────────────────────────────────────────────────────────
export const mockWorkers = [
  { _id: "wk1", name: "Rahul Mishra", rating: 4.8, jobsDone: 47, skills: ["Video Services", "Product Promotion"], serviceAreas: ["490001", "490006", "490020"], bio: "5 years in video production — weddings, commercials, reels.", pincode: "490001" },
  { _id: "wk2", name: "Priya Sahu", rating: 4.9, jobsDone: 63, skills: ["Medical Saathi", "Yatra Saathi"], serviceAreas: ["491001", "491002", "491441"], bio: "Trained care companion — 60+ satisfied families.", pincode: "491001" },
  { _id: "wk3", name: "Anil Tiwari", rating: 4.7, jobsDone: 31, skills: ["Video Services", "Video Editing"], serviceAreas: ["490001", "490006", "490009"], bio: "Freelance editor — YouTube, reels, podcast cuts.", pincode: "490006" },
  { _id: "wk4", name: "Sunita Dewangan", rating: 4.9, jobsDone: 89, skills: ["Medical Saathi", "NRI Parent Care"], serviceAreas: ["491001", "491441", "491221"], bio: "Elder care specialist — trusted by NRI families across Bhilai-Durg.", pincode: "491001" },
  { _id: "wk5", name: "Deepak Sharma", rating: 4.6, jobsDone: 22, skills: ["Yatra Saathi", "Medical Saathi"], serviceAreas: ["492001", "492010", "491001"], bio: "Pilgrimage and temple visit companion — patient and reliable.", pincode: "492001" },
];

export const pincodeAreas = {
  "490001": "Bhilai Sector 1", "490006": "Bhilai Sector 6", "490009": "Bhilai Sector 9",
  "490020": "Bhilai Risali", "491001": "Durg City", "491002": "Durg Station Area",
  "491221": "Balod Road", "491441": "Rajnandgaon", "492001": "Raipur City", "492010": "Raipur Civil Lines",
};

// ─── USER BOOKINGS (state managed in context) ─────────────────────────────────
export const mockBookings = [
  { _id: "b1", service: { _id: "v1", title: "New Home Arrivals Reel", category: "c1" }, package: { label: "Standard", price: 3499 }, worker: { _id: "wk1", name: "Rahul Mishra" }, date: "2026-08-05", time: "10:00 AM", address: "Sector 7, Bhilai", status: "pending_admin", createdAt: "2026-07-31" },
  { _id: "b2", service: { _id: "m1", title: "Medical Companion", category: "c2" }, package: { label: "Per Visit", price: 500 }, worker: { _id: "wk2", name: "Priya Sahu" }, date: "2026-07-20", time: "4:00 PM", address: "Civil Lines, Durg", status: "completed", upiRef: "UPI-7821934", createdAt: "2026-07-19" },
  { _id: "b3", service: { _id: "v6", title: "Wedding Highlights Reel", category: "c1" }, package: { label: "Premium", price: 1500 }, worker: { _id: "wk3", name: "Anil Tiwari" }, date: "2026-08-10", time: "2:00 PM", address: "Nehru Nagar, Bhilai", status: "assigned", createdAt: "2026-08-01" },
];

// ─── ADMIN BOOKING QUEUE ──────────────────────────────────────────────────────
export const mockAdminBookings = [
  { _id: "b1", user: { name: "Ankit Verma", phone: "98765 43210" }, service: { title: "New Home Arrivals Reel" }, package: { label: "Standard", price: 3499 }, worker: { _id: "wk1", name: "Rahul Mishra" }, date: "2026-08-05", time: "10:00 AM", address: "Sector 7, Bhilai", status: "pending_admin", createdAt: "2026-07-31" },
  { _id: "b3", user: { name: "Meena Patel", phone: "91234 56789" }, service: { title: "Wellness Check Visit" }, package: { label: "Monthly Plan", price: 2000 }, worker: { _id: "wk2", name: "Priya Sahu" }, date: "2026-08-07", time: "11:00 AM", address: "Power House, Durg", status: "pending_admin", createdAt: "2026-08-01" },
];

// ─── PENDING WORKERS ──────────────────────────────────────────────────────────
export const mockPendingWorkers = [
  { _id: "w1", name: "Suresh Yadav", phone: "94111 22333", skills: ["Video Services", "Product Promotion"], serviceAreas: ["490001", "490006"], aadhaarNumber: "XXXX-XXXX-1234", kycDocType: "Aadhaar + PAN", createdAt: "2026-07-28" },
  { _id: "w2", name: "Meena Patel", phone: "97655 44322", skills: ["Medical Saathi", "Yatra Saathi"], serviceAreas: ["491001", "491002"], aadhaarNumber: "XXXX-XXXX-5678", kycDocType: "Aadhaar + Voter ID", createdAt: "2026-07-29" },
];

// ─── WORKER JOBS ──────────────────────────────────────────────────────────────
export const mockWorkerJobs = [
  { _id: "j1", service: { title: "New Home Arrivals Reel" }, package: { label: "Standard", price: 3499 }, customerName: "Ankit Verma", customerPhone: "98765 43210", address: "Sector 7, Bhilai", date: "2026-08-05", time: "10:00 AM", status: "assigned", payout: 2799 },
  { _id: "j2", service: { title: "Medical Companion" }, package: { label: "Per Visit", price: 800 }, customerName: "Priya Verma", customerPhone: "91234 56789", address: "Civil Lines, Durg", date: "2026-07-20", time: "2:00 PM", status: "completed", payout: 640 },
  { _id: "j3", service: { title: "Wedding Highlights Reel" }, package: { label: "Premium", price: 1500 }, customerName: "Rohit Sharma", customerPhone: "97800 12345", address: "Nehru Nagar, Bhilai", date: "2026-08-10", time: "2:00 PM", status: "assigned", payout: 1200 },
];

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
export const mockAdminStats = {
  totalUsers: 214, totalWorkers: 38, pendingWorkers: 2, pendingBookings: 2,
  approvedWorkers: 34, totalBookings: 512, revenueThisMonth: 68450,
};

export const adminUPI = {
  upiId: "servio.payments@upi",
  qrCodeText: "upi://pay?pa=servio.payments@upi&pn=Servio&cu=INR",
  phoneNumber: "98110 00000",
};
