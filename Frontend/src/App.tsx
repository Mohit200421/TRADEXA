import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Reviews from "./pages/Reviews";
import ReplayBacktest from "./pages/ReplayBacktest";
import Replay from "./pages/Replay";
import HomePage from "./pages/HomePage";
import TradingViewPro from "./pages/TradingViewPro";
import Journal from "./pages/Journal";
import Performance from "./pages/Performance";
import Market from "./pages/Market";
import Community from "./pages/Community";
import Tools from "./pages/Tools";

import DashboardLayout from "./layouts/DashboardLayout";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard routes */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/replay" element={<Replay />} />
            <Route path="/replay-backtest" element={<ReplayBacktest />} />
            <Route path="/trading-chart" element={<TradingViewPro />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/market" element={<Market />} />
            <Route path="/community" element={<Community />} />
            <Route path="/tools" element={<Tools />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
