import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BarChart3,
  LineChart,
  PieChart,
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useJournals } from "../contexts/JournalContext";

/* =====================
   TYPES
===================== */
interface Trade {
  pnl: number;
  status: "OPEN" | "CLOSED";
  entryDate: string;
  symbol: string;
}

/* =====================
   HELPERS
===================== */
function getLocalDateKey(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedJournal } = useJournals();

  /* =====================
     MONTHLY P&L STATE
  ===================== */
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /* =====================
     FETCH TRADES
  ===================== */
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const journalId = selectedJournal?._id || "all";
        const res = await API.get(`/trades?journalId=${journalId}`);
        setTrades(res.data || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, [selectedJournal]);

  /* =====================
     STATS CALCULATIONS
  ===================== */
  const closedTrades = useMemo(
    () => trades.filter(t => t.status === "CLOSED"),
    [trades]
  );

  const totalPnL = closedTrades.reduce((s, t) => s + t.pnl, 0);

  const winningTrades = closedTrades.filter(t => t.pnl > 0);
  const losingTrades = closedTrades.filter(t => t.pnl < 0);

  const winRate =
    closedTrades.length === 0
      ? 0
      : Math.round((winningTrades.length / closedTrades.length) * 100);

  const totalProfit = winningTrades.reduce((s, t) => s + t.pnl, 0);
  const totalLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0));

  const profitFactor =
    totalLoss === 0 ? null : (totalProfit / totalLoss).toFixed(2);

  const bestTradeObj =
    closedTrades.length === 0
      ? null
      : closedTrades.reduce((best, t) =>
          t.pnl > best.pnl ? t : best
        );

  // Analytics calculations
  const profits = winningTrades.map(t => t.pnl);
  const losses = losingTrades.map(t => t.pnl);
  
  const avgWin = profits.length > 0
    ? profits.reduce((a, b) => a + b, 0) / profits.length
    : 0;
    
  const avgLoss = losses.length > 0
    ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length)
    : 0;
    
  const bestTrade = profits.length > 0 ? Math.max(...profits) : 0;
  const worstTrade = losses.length > 0 ? Math.min(...losses) : 0;

  /* =====================
     MONTHLY P&L DATA
  ===================== */
  const monthTrades = useMemo(() => {
    return closedTrades.filter(t => {
      const d = new Date(t.entryDate);
      return (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      );
    });
  }, [closedTrades, currentMonth]);

  const dailyTrades: Record<string, Trade[]> = {};
  monthTrades.forEach(trade => {
    const key = getLocalDateKey(trade.entryDate);
    if (!dailyTrades[key]) dailyTrades[key] = [];
    dailyTrades[key].push(trade);
  });

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOffset =
    (new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay() + 6) % 7;

  const monthKey = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  // IMPROVED LOADING UI
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6">
          {/* Animated dashboard preview */}
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xl">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 mb-3 animate-pulse" />
                  <div className="h-4 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded mb-2 animate-pulse" />
                  <div className="h-6 w-20 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
                </div>
              ))}
            </div>

            {/* Chart area skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                </div>
              </div>

              {/* Animated line chart */}
              <div className="relative h-32 flex items-end gap-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-400/50 to-blue-500/50 dark:from-blue-600/30 dark:to-blue-500/30 rounded-t animate-[barRise_1.5s_ease-in-out_infinite]"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-3 w-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Bottom stats skeleton */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="h-3 w-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded mb-2 animate-pulse" />
                  <div className="h-5 w-16 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Loading message with animated dots */}
          <div className="text-center mt-6 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500 dark:text-blue-400" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Loading Dashboard
              </p>
            </div>
            <div className="flex justify-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-[loadingDot_1.4s_ease-in-out_infinite]" />
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-[loadingDot_1.4s_ease-in-out_infinite_0.2s]" />
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-[loadingDot_1.4s_ease-in-out_infinite_0.4s]" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              Analyzing your trading performance...
            </p>
          </div>

          {/* Floating chart icons */}
          <div className="absolute top-1/4 left-4 opacity-20 hidden lg:block">
            <BarChart3 className="w-16 h-16 text-blue-500 dark:text-blue-400 animate-pulse" />
          </div>
          <div className="absolute bottom-1/4 right-4 opacity-20 hidden lg:block">
            <LineChart className="w-16 h-16 text-purple-500 dark:text-purple-400 animate-pulse" />
          </div>
          <div className="absolute top-1/3 right-1/4 opacity-20 hidden lg:block">
            <PieChart className="w-12 h-12 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================
          TOP STATS (CUSTOM UI) - Mobile Responsive
      ===================== */}
      <section className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* TOTAL P&L */}
        <div className="card p-4 sm:p-5 relative dark:bg-black dark:border-gray-800">
          <span className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 font-medium dark:bg-blue-900 dark:text-blue-300">
            TOTAL
          </span>

          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3 sm:mb-4 dark:bg-blue-900">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>

          <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">TOTAL P&amp;L</p>
          <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
            totalPnL >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400"
          }`}>
            {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL)}
          </p>

          <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400 mt-2">
            → {closedTrades.length} trades
          </p>
        </div>

        {/* WIN RATE */}
        <div className="card p-4 sm:p-5 dark:bg-black dark:border-gray-800">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3 sm:mb-4 dark:bg-purple-900">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
          </div>

          <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">WIN RATE</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold dark:text-white">{winRate}%</p>

          <div className="w-full h-2 bg-border-light rounded-full mt-3 dark:bg-gray-800">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all duration-500 dark:bg-blue-400"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* PROFIT FACTOR */}
        <div className="card p-4 sm:p-5 dark:bg-black dark:border-gray-800">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3 sm:mb-4 dark:bg-green-900">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
          </div>

          <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">PROFIT FACTOR</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold dark:text-white">
            {profitFactor ?? "--"}
          </p>

          <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">
            Higher is better
          </p>
        </div>
      </section>

      {/* RETURNS ON CAPITAL */}
      {selectedJournal && selectedJournal.initialBalance > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* CURRENT BALANCE */}
          <div className="card p-4 sm:p-5 dark:bg-black dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">Current Balance</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                  (selectedJournal.initialBalance + totalPnL) >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-500 dark:text-red-400"
                }`}>
                  {formatCurrency(selectedJournal.initialBalance + totalPnL)}
                </p>
                <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                  Initial: {formatCurrency(selectedJournal.initialBalance)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                (selectedJournal.initialBalance + totalPnL) >= selectedJournal.initialBalance 
                  ? "bg-green-100 dark:bg-green-900" 
                  : "bg-red-100 dark:bg-red-900"
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  (selectedJournal.initialBalance + totalPnL) >= selectedJournal.initialBalance 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`} />
              </div>
            </div>
          </div>

          {/* RETURNS ON CAPITAL */}
          <div className="card p-4 sm:p-5 dark:bg-black dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">Returns on Capital</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                  ((totalPnL / selectedJournal.initialBalance) * 100) >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-500 dark:text-red-400"
                }`}>
                  {totalPnL >= 0 ? "+" : ""}
                  {((totalPnL / selectedJournal.initialBalance) * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                  Based on initial: {formatCurrency(selectedJournal.initialBalance)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                ((totalPnL / selectedJournal.initialBalance) * 100) >= 0 
                  ? "bg-green-100 dark:bg-green-900" 
                  : "bg-red-100 dark:bg-red-900"
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  ((totalPnL / selectedJournal.initialBalance) * 100) >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================
          MONTHLY P&L - Mobile Responsive
      ===================== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* CALENDAR */}
        <div className="lg:col-span-2 card p-4 sm:p-5 dark:bg-black dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 dark:text-gray-300" />
              <div>
                <h3 className="font-semibold text-sm sm:text-base dark:text-white">Trading Calendar</h3>
                <p className="text-xs text-text-secondary dark:text-gray-400">
                  Daily P&amp;L heatmap – Click on days to see trades
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3">
              <button
                className="w-8 h-8 rounded-md bg-border-light hover:bg-border flex items-center justify-center dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                <ChevronLeft className="w-4 h-4 dark:text-gray-300" />
              </button>

              <span className="font-medium text-sm min-w-[120px] text-center dark:text-white">
                {currentMonth.toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <button
                className="w-8 h-8 rounded-md bg-border-light hover:bg-border flex items-center justify-center dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                <ChevronRight className="w-4 h-4 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* WEEKDAYS - Mobile Responsive */}
          <div className="grid grid-cols-7 text-[10px] xs:text-xs font-medium text-center mb-2 dark:text-gray-400">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="hidden xs:block">{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][i]}</div>
            ))}
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={`mobile-${i}`} className="block xs:hidden">{d}</div>
            ))}
          </div>

          {/* DAYS - Mobile Responsive */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={i} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
              const tradesForDay = dailyTrades[dateKey];
              const pnl = tradesForDay?.reduce((s, t) => s + t.pnl, 0) ?? null;
              const isToday = dateKey === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={dateKey}
                  onClick={() => tradesForDay && setSelectedDate(dateKey)}
                  disabled={!tradesForDay}
                  className={`h-10 sm:h-14 md:h-16 rounded-lg border p-1 sm:p-2 transition-all duration-200
                    ${pnl === null
                      ? "bg-bg cursor-default dark:bg-gray-900"
                      : "cursor-pointer hover:shadow-md dark:hover:shadow-gray-800"
                    }
                    ${pnl !== null && pnl >= 0
                      ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                      : pnl !== null && pnl < 0
                      ? "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20"
                      : "border-border dark:border-gray-800"
                    }
                    ${selectedDate === dateKey
                      ? "ring-2 ring-primary shadow-md dark:ring-blue-500"
                      : ""
                    }
                    ${isToday
                      ? "ring-1 ring-blue-300 dark:ring-blue-400"
                      : ""
                    }
                  `}
                >
                  <div className="text-xs sm:text-sm font-medium flex flex-col items-center dark:text-white">
                    <span className={isToday ? "text-blue-600 dark:text-blue-400 font-bold" : ""}>
                      {day}
                    </span>
                    {pnl !== null && (
                      <span className={`text-[10px] xs:text-xs font-semibold mt-0.5 ${
                        pnl >= 0 ? "text-blue-500 dark:text-blue-400" : "text-red-500 dark:text-red-400"
                      }`}>
                        {pnl >= 0 ? "+" : ""}${Math.abs(pnl).toFixed(pnl === 0 ? 0 : 1)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Legend for Mobile */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3 border-t border-border-light text-xs dark:border-gray-800">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"></div>
              <span className="text-text-secondary dark:text-gray-400">Profit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20"></div>
              <span className="text-text-secondary dark:text-gray-400">Loss</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded border border-blue-300 dark:border-blue-400"></div>
              <span className="text-text-secondary dark:text-gray-400">Today</span>
            </div>
          </div>
        </div>

        {/* DAY TRADES - Mobile Responsive */}
        <div className="card p-4 sm:p-5 dark:bg-black dark:border-gray-800">
          <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 dark:text-white">Day Trades</h3>

          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-60 text-text-secondary text-xs sm:text-sm dark:text-gray-400">
              <Calendar className="w-7 h-7 sm:w-9 sm:h-9 mb-2 opacity-50 dark:text-gray-500" />
              Click on a day with trades to view details
            </div>
          ) : (
            <>
              <p className="text-xs text-text-secondary mb-3 dark:text-gray-400">
                {new Date(selectedDate).toDateString()}
              </p>

              <div className="space-y-3 max-h-64 sm:max-h-80 overflow-auto pr-2">
                {dailyTrades[selectedDate].map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-3 sm:p-4 hover:border-primary transition-colors dark:border-gray-800 dark:hover:border-blue-500 dark:bg-gray-900"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2">
                      <p className="font-semibold text-sm dark:text-white">
                        Trade #{i + 1} · <span className="text-primary dark:text-blue-400">{t.symbol}</span>
                      </p>
                      <p className={`font-semibold text-base sm:text-lg ${
                        t.pnl >= 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-500 dark:text-red-400"
                      }`}>
                        {t.pnl >= 0 ? "+" : ""}{formatCurrency(t.pnl)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-text-secondary dark:text-gray-400">
                      <span className={`px-2 py-1 rounded-full ${
                        t.status === "CLOSED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      }`}>
                        {t.status}
                      </span>
                      <span className="flex items-center gap-1">
                        {new Date(t.entryDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Daily Summary */}
                <div className="p-3 bg-border-light rounded-lg dark:bg-gray-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary dark:text-gray-400">Daily Total</span>
                    <span className={`font-semibold ${
                      dailyTrades[selectedDate].reduce((sum, t) => sum + t.pnl, 0) >= 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-500 dark:text-red-400"
                    }`}>
                      {formatCurrency(dailyTrades[selectedDate].reduce((sum, t) => sum + t.pnl, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* =====================
          TOP PERFORMANCE - Mobile Responsive
      ===================== */}
      <section className="card p-4 sm:p-5 mt-4 sm:mt-6 dark:bg-black dark:border-gray-800">
        <h3 className="font-semibold text-sm sm:text-base mb-3 dark:text-white">Top Performance</h3>

        {bestTradeObj ? (
          <div className="rounded-lg bg-green-500/10 p-3 sm:p-4 dark:bg-green-900/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">Best Trade</p>
                <p className="text-lg sm:text-xl font-semibold text-green-500 dark:text-green-400">
                  +{formatCurrency(bestTradeObj.pnl)}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="text-xs text-text-secondary dark:text-gray-400">
                    {new Date(bestTradeObj.entryDate).toDateString()}
                  </p>
                  <p className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                    {bestTradeObj.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary text-center py-4 dark:text-gray-400">
            No trades yet
          </p>
        )}
      </section>

      {/* =====================
          QUICK STATS - Mobile Responsive
      ===================== */}
      <section className="card p-4 sm:p-5 mt-4 sm:mt-6 dark:bg-black dark:border-gray-800">
        <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 dark:text-white">Analytics</h3>

        <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-4 text-sm">
          <QuickStat label="Total Trades" value={closedTrades.length} />
          <QuickStat label="Winning Trades" value={winningTrades.length} />
          <QuickStat label="Losing Trades" value={losingTrades.length} />
          <QuickStat label="Profit Factor" value={profitFactor ?? "--"} />
          <QuickStat label="Avg Win" value={formatCurrency(avgWin)} />
          <QuickStat label="Avg Loss" value={formatCurrency(avgLoss)} />
          <QuickStat label="Best Trade" value={formatCurrency(bestTrade)} />
          <QuickStat label="Worst Trade" value={formatCurrency(worstTrade)} />
        </div>
      </section>
    </div>
  );
}

/* =====================
   SMALL COMPONENT
===================== */
function QuickStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg bg-border-light p-3 sm:p-4 text-center dark:bg-gray-800">
      <p className="text-xs text-text-secondary dark:text-gray-400">{label}</p>
      <p className="font-semibold text-base sm:text-lg dark:text-white">{value}</p>
    </div>
  );
}