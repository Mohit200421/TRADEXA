import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ ADD THIS
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

import VerifyEmailOTP from "./pages/VerifyEmailOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";

import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Reviews from "./pages/Reviews";
import ReplayBacktest from "./pages/ReplayBacktest";
import Replay from "./pages/Replay";
import TradingViewPro from "./pages/TradingViewPro";
import Journal from "./pages/Journal";
import Performance from "./pages/Performance";
import Market from "./pages/Market";
import Learn from "./pages/Learn";
import Community from "./pages/Community";
import Tools from "./pages/Tools";
import Profile from "./pages/Profile";

import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider> {/* ✅ THIS FIXES EVERYTHING */}
        <BrowserRouter>
          <Toaster position="top-right" />

          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email-otp" element={<VerifyEmailOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ================= PROTECTED ROUTES ================= */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/trades" element={<Trades />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/replay" element={<Replay />} />
              <Route path="/replay-backtest" element={<ReplayBacktest />} />
              <Route path="/trading-chart" element={<TradingViewPro />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/market" element={<Market />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/community" element={<Community />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
