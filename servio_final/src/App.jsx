import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import RequireRole from "./components/shared/RequireRole.jsx";

import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Terms from "./pages/legal/Terms.jsx";

import UserShell from "./components/user/UserShell.jsx";
import Home from "./pages/user/Home.jsx";
import Services from "./pages/user/Services.jsx";
import ServiceDetail from "./pages/user/ServiceDetail.jsx";
import Bookings from "./pages/user/Bookings.jsx";
import Profile from "./pages/user/Profile.jsx";

import WorkerShell from "./components/worker/WorkerShell.jsx";
import PendingApproval from "./pages/worker/PendingApproval.jsx";
import Jobs from "./pages/worker/Jobs.jsx";
import JobDetail from "./pages/worker/JobDetail.jsx";
import Schedule from "./pages/worker/Schedule.jsx";
import Earnings from "./pages/worker/Earnings.jsx";
import WorkerProfile from "./pages/worker/WorkerProfile.jsx";

import AdminShell from "./components/admin/AdminShell.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Catalog from "./pages/admin/Catalog.jsx";
import WorkerApprovals from "./pages/admin/WorkerApprovals.jsx";
import BookingApprovals from "./pages/admin/BookingApprovals.jsx";
import UsersList from "./pages/admin/UsersList.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Root goes straight into the browsable app — no login wall.
            Login/signup only appear when the person tries to book. */}
        <Route path="/" element={<Navigate to="/user" replace />} />

        <Route path="/login/:role" element={<Login />} />
        <Route path="/signup/:role" element={<Signup />} />
        <Route path="/forgot-password/:role" element={<ForgotPassword />} />
        <Route path="/reset-password/:role/:token" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/worker/pending" element={<PendingApproval />} />

        {/* User side is public — anyone can browse Home/Services/Bookings/Profile.
            Bookings/Profile show a "log in to continue" prompt for guests,
            and the actual booking action is what triggers login/signup. */}
        <Route path="/user" element={<UserShell />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        {/* Full-screen booking flow — no bottom nav, has its own header + CTA bar.
            Browsing plans/partners is public; confirming the booking requires login. */}
        <Route path="/user/services/:id" element={<ServiceDetail />} />

        <Route element={<RequireRole role="worker" />}>
          <Route path="/worker" element={<WorkerShell />}>
            <Route index element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="profile" element={<WorkerProfile />} />
          </Route>
        </Route>

        {/* Admin is intentionally not linked from anywhere in the public UI —
            reachable only by someone who already knows this URL. */}
        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<Dashboard />} />
            <Route path="catalog" element={<Catalog />} />
            <Route path="bookings" element={<BookingApprovals />} />
            <Route path="workers" element={<WorkerApprovals />} />
            <Route path="users" element={<UsersList />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
