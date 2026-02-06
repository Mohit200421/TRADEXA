import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";

import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import AddTradePage from "./pages/AddTradePage";
import TradeDetails from "./pages/TradeDetails";
import Reviews from "./pages/Reviews";
import Replay from "./pages/Replay";
import ReplayBacktest from "./pages/ReplayBacktest";
import TradingViewPro from "./pages/TradingViewPro";
import Performance from "./pages/Performance";
import Market from "./pages/Market";
import Learn from "./pages/Learn";
import CommunityList from "./pages/CommunityList";
import CommunityPage from "./pages/CommunityPage";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Tools from "./pages/Tools";

import PositionSizeCalculator from "./tools/PositionSizeCalculator";
import ProfitCalculator from "./tools/ProfitCalculator";

import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" />

          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<HomePage />} />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

<Route path="/verify-email" element={<VerifyEmail />} />

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
              <Route path="/trades/add" element={<AddTradePage />} />
              <Route path="/trades/:tradeId" element={<TradeDetails />} />
              <Route path="/reviews" element={<Reviews />} />

              <Route path="/replay" element={<Replay />} />
              <Route path="/replay-backtest" element={<ReplayBacktest />} />
              <Route path="/trading-chart" element={<TradingViewPro />} />

              <Route path="/performance" element={<Performance />} />
              <Route path="/market" element={<Market />} />
              <Route path="/learn" element={<Learn />} />

              <Route path="/community" element={<CommunityList />} />
              <Route
                path="/community/:communityId"
                element={<CommunityPage />}
              />

              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />

              <Route path="/tools" element={<Tools />} />
              <Route
                path="/tools/position-size-calculator"
                element={<PositionSizeCalculator />}
              />
              <Route
                path="/tools/profit-calculator"
                element={<ProfitCalculator />}
              />
            </Route>

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

//sdcnsdnvoisvvnldsv