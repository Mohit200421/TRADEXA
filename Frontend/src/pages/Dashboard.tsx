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
  Award,
  Flame,
  Activity,
  Zap,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useJournals } from "../contexts/JournalContext";
import EquityCurveChart from "../components/EquityCurveChart";
import { format, subMonths, isAfter, startOfWeek, endOfWeek, eachDayOfInterval, getWeek } from "date-fns";

/* =====================
   TYPES
===================== */
interface Trade {
  pnl: number;
  status: "OPEN" | "CLOSED";
  entryDate: string;
  symbol: string;
}

interface WeekData {
  weekNumber: number;
  days: {
    date: Date;
    dayNumber: number;
    pnl: number | null;
    tradeCount: number;
    trades?: Trade[];
    avgRR?: number;
  }[];
  totalPnL: number;
  totalTrades: number;
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

function formatCompactNumber(num: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(num);
}

function formatK(num: number) {
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...new Set(dates.map(d => format(new Date(d), 'yyyy-MM-dd')))].sort();
  let streak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }
  
  return maxStreak;
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { selectedJournal } = useJournals();

  /* =====================
     UI STATE
  ===================== */
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<"all" | "month" | "quarter" | "year">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /* =====================
     FETCH TRADES
  ===================== */
  const fetchTrades = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);
      
      const journalId = selectedJournal?._id || "all";
      const res = await API.get(`/trades?journalId=${journalId}`);
      setTrades(res.data || []);
      
      if (showRefreshToast) {
        toast.success("Dashboard updated", {
          icon: <RefreshCw className="w-4 h-4" />,
          duration: 2000,
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [selectedJournal]);

  /* =====================
     STATS CALCULATIONS
  ===================== */
  const closedTrades = useMemo(
    () => trades.filter(t => t.status === "CLOSED"),
    [trades]
  );

  // Filter trades based on date range
  const filteredTrades = useMemo(() => {
    if (dateRange === "all") return closedTrades;
    
    const now = new Date();
    let cutoff = now;
    
    switch (dateRange) {
      case "month":
        cutoff = subMonths(now, 1);
        break;
      case "quarter":
        cutoff = subMonths(now, 3);
        break;
      case "year":
        cutoff = subMonths(now, 12);
        break;
    }
    
    return closedTrades.filter(t => isAfter(new Date(t.entryDate), cutoff));
  }, [closedTrades, dateRange]);

  const totalPnL = filteredTrades.reduce((s, t) => s + t.pnl, 0);
  const winningTrades = filteredTrades.filter(t => t.pnl > 0);
  const losingTrades = filteredTrades.filter(t => t.pnl < 0);
  
  const winRate = filteredTrades.length === 0
    ? 0
    : Math.round((winningTrades.length / filteredTrades.length) * 100);

  const totalProfit = winningTrades.reduce((s, t) => s + t.pnl, 0);
  const totalLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = totalLoss === 0 ? null : (totalProfit / totalLoss).toFixed(2);

  // Advanced analytics
  const profits = winningTrades.map(t => t.pnl);
  const losses = losingTrades.map(t => t.pnl);
  
  const avgWin = profits.length > 0 ? profits.reduce((a, b) => a + b, 0) / profits.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;
  const bestTrade = profits.length > 0 ? Math.max(...profits) : 0;
  const worstTrade = losses.length > 0 ? Math.min(...losses) : 0;
  
  const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);
  
  const tradeDates = filteredTrades.map(t => t.entryDate);
  const currentStreak = calculateStreak(tradeDates);
  
  const avgRR = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : "∞";
  
  const bestTradeObj = filteredTrades.length === 0
    ? null
    : filteredTrades.reduce((best, t) => t.pnl > best.pnl ? t : best);

  /* =====================
     DAILY TRADES MAPPING
  ===================== */
  const dailyTrades: Record<string, Trade[]> = {};
  filteredTrades.forEach(trade => {
    const key = getLocalDateKey(trade.entryDate);
    if (!dailyTrades[key]) dailyTrades[key] = [];
    dailyTrades[key].push(trade);
  });

  /* =====================
     MONTHLY P&L DATA
  ===================== */
  const monthTrades = useMemo(() => {
    return filteredTrades.filter(t => {
      const d = new Date(t.entryDate);
      return (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      );
    });
  }, [filteredTrades, currentMonth]);

  /* =====================
     WEEKLY CALENDAR DATA
  ===================== */
  const calendarWeeks = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get the first day of the week containing the 1st of the month (starting Monday)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday as first day
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    // Group days by week
    const weeks: WeekData[] = [];
    let currentWeekDays: typeof allDays = [];
    
    allDays.forEach((day, index) => {
      currentWeekDays.push(day);
      
      if (currentWeekDays.length === 7 || index === allDays.length - 1) {
        const weekNumber = getWeek(day, { weekStartsOn: 1 });
        
        const weekData: WeekData = {
          weekNumber,
          days: currentWeekDays.map(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayTrades = dailyTrades[dateKey] || [];
            const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
            
            // Calculate average R multiple for the day
            const avgRR = dayTrades.length > 0 
              ? (dayTrades.reduce((sum, t) => sum + (t.pnl > 0 ? t.pnl / avgWin : t.pnl / avgLoss), 0) / dayTrades.length).toFixed(1)
              : null;
            
            return {
              date,
              dayNumber: date.getDate(),
              pnl: dayTrades.length > 0 ? pnl : null,
              tradeCount: dayTrades.length,
              trades: dayTrades,
              avgRR: avgRR ? parseFloat(avgRR) : null,
            };
          }),
          totalPnL: 0,
          totalTrades: 0,
        };
        
        weekData.totalPnL = weekData.days.reduce((sum, day) => sum + (day.pnl || 0), 0);
        weekData.totalTrades = weekData.days.reduce((sum, day) => sum + day.tradeCount, 0);
        
        weeks.push(weekData);
        currentWeekDays = [];
      }
    });
    
    return weeks;
  }, [currentMonth, dailyTrades, avgWin, avgLoss]);

  const monthStats = {
    totalPnL: monthTrades.reduce((sum, t) => sum + t.pnl, 0),
    tradeCount: monthTrades.length,
    winningDays: Object.values(dailyTrades)
      .filter(dayTrades => {
        const date = new Date(dayTrades[0].entryDate);
        return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
      })
      .filter(dayTrades => dayTrades.reduce((sum, t) => sum + t.pnl, 0) > 0).length,
    losingDays: Object.values(dailyTrades)
      .filter(dayTrades => {
        const date = new Date(dayTrades[0].entryDate);
        return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
      })
      .filter(dayTrades => dayTrades.reduce((sum, t) => sum + t.pnl, 0) < 0).length,
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6">
          {/* Loading skeleton */}
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's your trading performance overview
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Date Range Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: "all", label: "All" },
              { key: "month", label: "1M" },
              { key: "quarter", label: "3M" },
              { key: "year", label: "1Y" },
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => setDateRange(range.key as any)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  dateRange === range.key
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => fetchTrades(true)}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${
              refreshing ? 'animate-spin' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* =====================
          TOP STATS CARDS
      ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total P&L Card */}
        <div className="card p-5 dark:bg-black dark:border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                totalPnL >= 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {totalPnL >= 0 ? 'Profitable' : 'Loss'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total P&L</p>
            <p className={`text-2xl font-bold ${
              totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredTrades.length} trades
              </span>
              {filteredTrades.length > 0 && (
                <span className="text-xs text-gray-400">
                  · Avg: {formatCurrency(totalPnL / filteredTrades.length)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="card p-5 dark:bg-black dark:border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                Win Rate
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
            <p className="text-2xl font-bold dark:text-white">{winRate}%</p>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
              <div
                className="h-1.5 bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${winRate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{winningTrades.length} wins</span>
              <span>{losingTrades.length} losses</span>
            </div>
          </div>
        </div>

        {/* Profit Factor Card */}
        <div className="card p-5 dark:bg-black dark:border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {profitFactor && parseFloat(profitFactor) > 1.5 ? 'Excellent' : profitFactor && parseFloat(profitFactor) > 1 ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Profit Factor</p>
            <p className="text-2xl font-bold dark:text-white">{profitFactor ?? '--'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Win/Loss: {winningTrades.length}:{losingTrades.length}
              </span>
            </div>
          </div>
        </div>

        {/* Expectancy Card */}
        <div className="card p-5 dark:bg-black dark:border-gray-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-bl-full group-hover:scale-150 transition-transform duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                Per Trade
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Expectancy</p>
            <p className={`text-2xl font-bold ${
              expectancy >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {expectancy >= 0 ? '+' : ''}{formatCurrency(expectancy)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Avg RR: {avgRR}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================
          ACCOUNT SUMMARY
      ===================== */}
      {selectedJournal && selectedJournal.initialBalance > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Current Balance */}
          <div className="card p-5 dark:bg-black dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Balance</p>
                <p className={`text-2xl font-bold ${
                  (selectedJournal.initialBalance + totalPnL) >= selectedJournal.initialBalance 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-500 dark:text-red-400"
                }`}>
                  {formatCurrency(selectedJournal.initialBalance + totalPnL)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Initial: {formatCurrency(selectedJournal.initialBalance)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                (selectedJournal.initialBalance + totalPnL) >= selectedJournal.initialBalance 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-red-100 dark:bg-red-900/30"
              }`}>
                <DollarSign className={`w-6 h-6 ${
                  (selectedJournal.initialBalance + totalPnL) >= selectedJournal.initialBalance 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`} />
              </div>
            </div>
          </div>

          {/* Returns */}
          <div className="card p-5 dark:bg-black dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Return</p>
                <p className={`text-2xl font-bold ${
                  ((totalPnL / selectedJournal.initialBalance) * 100) >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-500 dark:text-red-400"
                }`}>
                  {totalPnL >= 0 ? "+" : ""}
                  {((totalPnL / selectedJournal.initialBalance) * 100).toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatCurrency(totalPnL)} absolute
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                ((totalPnL / selectedJournal.initialBalance) * 100) >= 0 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-red-100 dark:bg-red-900/30"
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  ((totalPnL / selectedJournal.initialBalance) * 100) >= 0 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`} />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="card p-5 dark:bg-black dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Best Streak</p>
                <p className="text-2xl font-bold dark:text-white">
                  {currentStreak} <span className="text-sm font-normal text-gray-500">days</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Consecutive trading days
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EQUITY CURVE */}
      <EquityCurveChart />

      {/* =====================
          TRADING CALENDAR - Exact match to image
      ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-5 dark:bg-black dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <h3 className="font-semibold dark:text-white">Trading Calendar</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daily P&L and trade count · {monthStats.tradeCount} trades this month
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-gray-500 dark:text-gray-400">Month total:</span>
                <span className={`font-semibold ${
                  monthStats.totalPnL >= 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {monthStats.totalPnL >= 0 ? '+' : ''}{formatCurrency(monthStats.totalPnL)}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                  onClick={() => setCurrentMonth(new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1
                  ))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="font-medium text-sm min-w-[100px] text-center dark:text-white">
                  {format(currentMonth, 'MMM yyyy')}
                </span>

                <button
                  className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                  onClick={() => setCurrentMonth(new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1
                  ))}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid - Exact match to image */}
          <div className="space-y-4">
            {/* Weekday Headers - ALL CAPS as in image */}
            <div className="grid grid-cols-7 gap-1 text-[10px] sm:text-xs font-bold text-center text-gray-500 dark:text-gray-400 tracking-wider">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Weeks */}
            {calendarWeeks.map((week, weekIndex) => (
              <div key={week.weekNumber} className="space-y-1">
                {/* Days Row */}
                <div className="grid grid-cols-7 gap-1">
                  {week.days.map((day, dayIndex) => {
                    const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();
                    const hasTrades = day.trades && day.trades.length > 0;
                    
                    return (
                      <button
                        key={dayIndex}
                        onClick={() => {
                          if (hasTrades) {
                            setSelectedDate(format(day.date, 'yyyy-MM-dd'));
                          }
                        }}
                        disabled={!hasTrades}
                        className={`aspect-square rounded-lg border transition-all duration-200 p-1
                          ${!isCurrentMonth ? 'opacity-30' : ''}
                          ${hasTrades
                            ? day.pnl && day.pnl > 0
                              ? 'border-green-500 dark:border-green-500 hover:shadow-md bg-green-50/10 dark:bg-green-900/5'
                              : day.pnl && day.pnl < 0
                                ? 'border-red-500 dark:border-red-500 hover:shadow-md bg-red-50/10 dark:bg-red-900/5'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            : 'border-gray-100 dark:border-gray-800 cursor-default'
                          }
                          ${selectedDate === format(day.date, 'yyyy-MM-dd') ? 'ring-2 ring-blue-500 shadow-lg' : ''}
                        `}
                      >
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          {/* Day Number */}
                          <span className="text-xs sm:text-sm font-bold dark:text-white">
                            {day.dayNumber}
                          </span>
                          
                          {/* P&L - Format as in image: -$500, +$2K */}
                          {hasTrades && day.pnl !== null && (
                            <span className={`text-[9px] sm:text-xs font-semibold leading-tight ${
                              day.pnl > 0 ? 'text-green-600 dark:text-green-400' : 
                              day.pnl < 0 ? 'text-red-500 dark:text-red-400' : 
                              'text-gray-500'
                            }`}>
                              {day.pnl > 0 ? '+' : ''}
                              {Math.abs(day.pnl) >= 1000 
                                ? formatK(day.pnl)
                                : formatCurrency(day.pnl).replace('$', '')}
                            </span>
                          )}
                          
                          {/* Trade Count and R Multiple - Format as in image: 4Trades·2R */}
                          {hasTrades && day.tradeCount > 0 && (
                            <span className="text-[7px] sm:text-[8px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                              {day.tradeCount}Trades
                              {day.avgRR !== null && (
                                <>·{day.avgRR > 0 ? '' : '-'}{Math.abs(day.avgRR || 0).toFixed(1)}R</>
                              )}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Week Total Row - Optional, can be removed if not needed */}
                {/* <div className="grid grid-cols-7 gap-1 mt-1 pt-1 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <div className="col-span-6 text-right text-[8px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Week {weekIndex + 1}:
                  </div>
                  <div className={`text-[8px] sm:text-xs font-bold text-right ${
                    week.totalPnL > 0 ? 'text-green-600' : week.totalPnL < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {week.totalPnL > 0 ? '+' : ''}{formatK(week.totalPnL)}
                  </div>
                </div> */}
              </div>
            ))}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">No trades</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>Winning days: {monthStats.winningDays}</span>
              <span>·</span>
              <span>Losing days: {monthStats.losingDays}</span>
            </div>
          </div>
        </div>

        {/* Day Trades Panel */}
        <div className="card p-5 dark:bg-black dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold dark:text-white">Day Trades</h3>
              {selectedDate && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  {format(new Date(selectedDate), 'MMM d')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                  title="Grid view"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                  }`}
                  title="List view"
                >
                  <Activity className="w-4 h-4" />
                </button>
              </div>
              
              {/* Clear Selection Button */}
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="relative">
                <Calendar className="w-16 h-16 mb-3 opacity-20 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                </div>
              </div>
              <p className="text-sm text-center font-medium">No day selected</p>
              <p className="text-xs text-center mt-1 opacity-75">
                Click on any day in the calendar to view trades
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium dark:text-white">
                  {format(new Date(selectedDate), 'EEEE, MMM d')}
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {dailyTrades[selectedDate]?.length || 0} trades
                </span>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-auto pr-1">
                  {dailyTrades[selectedDate]?.map((trade, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border dark:border-gray-800 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {trade.symbol}
                        </span>
                        <span className={`text-xs font-semibold ${
                          trade.pnl >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{format(new Date(trade.entryDate), 'HH:mm')}</span>
                        <span className={`px-1.5 py-0.5 rounded-full ${
                          trade.status === 'CLOSED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {trade.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-auto pr-1">
                  {dailyTrades[selectedDate]?.map((trade, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-800 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          trade.pnl >= 0 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {trade.pnl >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium dark:text-white">{trade.symbol}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(trade.entryDate), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          trade.pnl >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </p>
                        <p className={`text-xs ${
                          trade.status === 'CLOSED' 
                            ? 'text-green-600' 
                            : 'text-blue-600'
                        }`}>
                          {trade.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Daily Summary */}
              {dailyTrades[selectedDate] && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily Total</span>
                    <span className={`text-lg font-bold ${
                      dailyTrades[selectedDate].reduce((sum, t) => sum + t.pnl, 0) >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-500 dark:text-red-400'
                    }`}>
                      {formatCurrency(dailyTrades[selectedDate].reduce((sum, t) => sum + t.pnl, 0))}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* =====================
          PERFORMANCE HIGHLIGHTS
      ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best Trade */}
        <div className="card p-5 dark:bg-black dark:border-gray-800">
          <h3 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            Best Performance
          </h3>
          {bestTradeObj ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                🏆
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium dark:text-white">{bestTradeObj.symbol}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(bestTradeObj.entryDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    +{formatCurrency(bestTradeObj.pnl)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No trades yet
            </p>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="card p-5 dark:bg-black dark:border-gray-800">
          <h3 className="font-semibold mb-3 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Analytics Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickStat 
              label="Avg Win" 
              value={formatCurrency(avgWin)}
              icon={<TrendingUp className="w-3 h-3 text-green-600" />}
            />
            <QuickStat 
              label="Avg Loss" 
              value={formatCurrency(avgLoss)}
              icon={<TrendingDown className="w-3 h-3 text-red-500" />}
            />
            <QuickStat 
              label="Best Trade" 
              value={formatCurrency(bestTrade)}
              icon={<Award className="w-3 h-3 text-yellow-500" />}
            />
            <QuickStat 
              label="Worst Trade" 
              value={formatCurrency(worstTrade)}
              icon={<Flame className="w-3 h-3 text-orange-500" />}
            />
            <QuickStat 
              label="Win Rate" 
              value={`${winRate}%`}
              icon={<Target className="w-3 h-3 text-purple-500" />}
            />
            <QuickStat 
              label="Profit Factor" 
              value={profitFactor ?? "--"}
              icon={<DollarSign className="w-3 h-3 text-green-500" />}
            />
            <QuickStat 
              label="Expectancy" 
              value={formatCurrency(expectancy)}
              icon={<Zap className="w-3 h-3 text-orange-500" />}
            />
            <QuickStat 
              label="Total Trades" 
              value={filteredTrades.length}
              icon={<Activity className="w-3 h-3 text-blue-500" />}
            />
          </div>
        </div>
      </div>

      {/* Global styles for animations */}
      <style>{`
        @keyframes barRise {
          0%, 100% { transform: scaleY(0.8); opacity: 0.5; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
        @keyframes loadingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* =====================
   SMALL COMPONENTS
===================== */
interface QuickStatProps {
  label: string;
  value: any;
  icon?: React.ReactNode;
}

function QuickStat({ label, value, icon }: QuickStatProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
        {icon}
        {label}
      </div>
      <p className="font-semibold text-sm dark:text-white truncate">{value}</p>
    </div>
  );
}