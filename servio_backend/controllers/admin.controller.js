import User from "../models/User.js";
import Worker from "../models/Worker.js";
import Booking from "../models/Booking.js";

export const getStats = async (req, res) => {
  const [totalUsers, totalWorkers, approvedWorkers, pendingWorkers, pendingBookings, totalBookings, completedThisMonth] =
    await Promise.all([
      User.countDocuments(),
      Worker.countDocuments(),
      Worker.countDocuments({ kycStatus: "approved" }),
      Worker.countDocuments({ kycStatus: "pending" }),
      Booking.countDocuments({ status: "pending_admin" }),
      Booking.countDocuments(),
      Booking.find({
        status: "completed",
        updatedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
    ]);

  const revenueThisMonth = completedThisMonth.reduce((sum, b) => sum + (b.package?.price || 0), 0);

  res.json({
    stats: {
      totalUsers,
      totalWorkers,
      approvedWorkers,
      pendingWorkers,
      pendingBookings,
      totalBookings,
      revenueThisMonth,
    },
  });
};

export const getUsers = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ users });
};
