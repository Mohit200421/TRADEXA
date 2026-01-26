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

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            className: '!bg-light-surface dark:!bg-dark-surface !text-light-text dark:!text-dark-text !border !border-light-border dark:!border-dark-border',
          }}
        />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/replay" element={<Replay />} />
          <Route path="/replay-backtest" element={<ReplayBacktest />} />
          <Route path="/trading-chart" element={<TradingViewPro />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}