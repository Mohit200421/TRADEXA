import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, DollarSign, Target, BarChart3, 
  Calendar, PieChart as PieChartIcon, LineChart as LineChartIcon,
  BarChart as BarChartIcon, Award, Clock, Activity, 
  Shield, RefreshCw, Maximize2, Download, Filter, Settings, 
  Bell, Search, ArrowUpRight, ArrowDownRight, Sparkles, 
  Wallet, Globe, Cpu, Database, Cloud, Menu, X, Home,
  BookOpen, LogOut, User, FileText, BarChart2, MessageSquare,
  ChevronLeft, ChevronRight as ChevronRightIcon, PlayCircle,
  BookMarked, LayoutDashboard, ChartBar, Users, PlusCircle,
  Filter as FilterIcon, MoreVertical, Eye, EyeOff,
  TrendingUp as TrendingUpIcon, Trophy, Zap, Target as TargetIcon
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  getAnalyticsSummary,
  getEquityCurve,
  getMonthlyAnalytics,
  getAdvancedAnalytics,
  getRecentTrades,
} from "../services/tradeService";
import { useTheme } from "../contexts/ThemeContext";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [curve, setCurve] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [advanced, setAdvanced] = useState<any>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAllStats, setShowAllStats] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [summaryRes, curveRes, monthlyRes, advRes, tradesRes] = await Promise.all([
        getAnalyticsSummary(),
        getEquityCurve(),
        getMonthlyAnalytics(),
        getAdvancedAnalytics(),
        getRecentTrades({ limit: 5 })
      ]);

      setData(summaryRes.data);
      setCurve(curveRes.data || []);
      setMonthly(monthlyRes.data || []);
      setAdvanced(advRes.data || {});
      setRecentTrades(tradesRes.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const navItems = [
    { 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: "Dashboard", 
      path: "/dashboard",
      active: true
    },
    { 
      icon: <ChartBar className="w-5 h-5" />, 
      label: "Bar Replay", 
      path: "/replay",
      description: "Practice trading"
    },
    { 
      icon: <BookMarked className="w-5 h-5" />, 
      label: "Trading Journal", 
      path: "/trades",
      description: "Log & review trades"
    },
    { 
      icon: <BarChart2 className="w-5 h-5" />, 
      label: "Analytics", 
      path: "/analytics"
    },
    { 
      icon: <Calendar className="w-5 h-5" />, 
      label: "Reviews", 
      path: "/reviews"
    },
  ];

  // Calculate real metrics from trades data
  const calculateRealMetrics = () => {
    if (!recentTrades.length) return null;

    const winningTrades = recentTrades.filter(t => t.pnl > 0);
    const losingTrades = recentTrades.filter(t => t.pnl < 0);
    const totalPnL = recentTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin = winningTrades.length ? 
      winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length ? 
      Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0)) / losingTrades.length : 0;
    const winRate = recentTrades.length ? 
      (winningTrades.length / recentTrades.length) * 100 : 0;
    const profitFactor = losingTrades.length ? 
      Math.abs(winningTrades.reduce((sum, t) => sum + t.pnl, 0)) / 
      Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0)) : 0;

    return {
      totalPnL,
      avgWin,
      avgLoss,
      winRate,
      profitFactor,
      totalTrades: recentTrades.length,
      wins: winningTrades.length,
      losses: losingTrades.length,
    };
  };

  const realMetrics = calculateRealMetrics();
  const metrics = realMetrics || data;

  // Prepare chart data from real trades
  const prepareDailyPnLData = () => {
    if (!recentTrades.length) {
      return Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        pnl: 0,
        trades: 0
      }));
    }

    // Group trades by day
    const grouped = recentTrades.reduce((acc, trade) => {
      const date = new Date(trade.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (!acc[date]) {
        acc[date] = { pnl: 0, count: 0 };
      }
      acc[date].pnl += trade.pnl || 0;
      acc[date].count += 1;
      return acc;
    }, {});

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      pnl: grouped[day]?.pnl || 0,
      trades: grouped[day]?.count || 0
    }));
  };

  const dailyPnLData = prepareDailyPnLData();

  // Prepare symbol performance from real trades
  const prepareSymbolPerformance = () => {
    if (!recentTrades.length) return [];

    const symbolMap = recentTrades.reduce((acc, trade) => {
      if (!trade.symbol) return acc;
      if (!acc[trade.symbol]) {
        acc[trade.symbol] = { pnl: 0, trades: 0 };
      }
      acc[trade.symbol].pnl += trade.pnl || 0;
      acc[trade.symbol].trades += 1;
      return acc;
    }, {});

    return Object.entries(symbolMap)
      .map(([symbol, data]: any) => ({
        symbol,
        pnl: data.pnl,
        trades: data.trades
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);
  };

  const symbolPerformance = prepareSymbolPerformance();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your trading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trading Analytics</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAllData}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link
                to="/trades?action=new"
                className="p-2 rounded-lg bg-green-500 text-white"
              >
                <PlusCircle className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Mobile Stats Summary */}
          {metrics && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg p-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">PnL</div>
                <div className={`text-sm font-bold ${metrics.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${metrics.totalPnL?.toFixed(2)}
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg p-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">Win Rate</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {metrics.winRate?.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg p-2">
                <div className="text-xs text-gray-600 dark:text-gray-400">Trades</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {metrics.totalTrades}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">TradeFX</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2 flex-1">
                {navItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                      item.active
                        ? "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <div className="ml-3 flex-1">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  <Link
                    to="/trades?action=new"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BookOpen className="w-4 h-4" />
                    New Trade Entry
                  </Link>
                  <Link
                    to="/replay"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Start Replay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 lg:p-6">
        {/* Time Range Selector - Mobile */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range</div>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {["7d", "30d", "90d"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    timeRange === range
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              title="Total PnL"
              value={`$${metrics.totalPnL?.toFixed(2)}`}
              change={metrics.totalPnL >= 0 ? "+" : ""}
              icon={<DollarSign className="w-5 h-5" />}
              color={metrics.totalPnL >= 0 ? "green" : "red"}
              trend={metrics.totalPnL >= 0 ? "up" : "down"}
              mobile
            />
            <StatCard
              title="Win Rate"
              value={`${metrics.winRate?.toFixed(1)}%`}
              change=""
              icon={<Target className="w-5 h-5" />}
              color="blue"
              trend="up"
              mobile
            />
            <StatCard
              title="Total Trades"
              value={metrics.totalTrades}
              change={`${metrics.wins || 0}W / ${metrics.losses || 0}L`}
              icon={<Activity className="w-5 h-5" />}
              color="purple"
              trend="up"
              mobile
            />
            <StatCard
              title="Profit Factor"
              value={metrics.profitFactor?.toFixed(2)}
              change={metrics.profitFactor > 1 ? "Good" : "Poor"}
              icon={<TrendingUpIcon className="w-5 h-5" />}
              color={metrics.profitFactor > 1 ? "green" : "orange"}
              trend={metrics.profitFactor > 1 ? "up" : "down"}
              mobile
            />
          </div>
        )}

        {/* Equity Curve - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Equity Curve</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Based on your journaled trades</p>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {curve.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center">
              <LineChartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No equity data yet</p>
              <Link 
                to="/trades" 
                className="mt-2 text-sm text-blue-600 dark:text-blue-400"
              >
                Add your first trade →
              </Link>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve}>
                  <defs>
                    <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="equity" 
                    stroke="#3b82f6" 
                    fill="url(#colorMobile)" 
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '12px'
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Performance Metrics & Distribution - Side by side on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Performance</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Key metrics</p>
              </div>
              <button 
                onClick={() => setShowAllStats(!showAllStats)}
                className="text-xs text-blue-600 dark:text-blue-400"
              >
                {showAllStats ? 'Show Less' : 'Show More'}
              </button>
            </div>

            <div className="space-y-3">
              <MetricItem 
                label="Avg Win" 
                value={`$${metrics?.avgWin?.toFixed(2)}`} 
                color="green"
              />
              <MetricItem 
                label="Avg Loss" 
                value={`$${metrics?.avgLoss?.toFixed(2)}`} 
                color="red"
              />
              <MetricItem 
                label="Best Trade" 
                value={`$${(recentTrades.reduce((max, t) => Math.max(max, t.pnl || 0), 0) || 0).toFixed(2)}`} 
                color="green"
              />
              <MetricItem 
                label="Worst Trade" 
                value={`$${(recentTrades.reduce((min, t) => Math.min(min, t.pnl || 0), 0) || 0).toFixed(2)}`} 
                color="red"
              />
              
              {showAllStats && metrics && (
                <>
                  <MetricItem 
                    label="Win/Loss Ratio" 
                    value={metrics.avgWin && metrics.avgLoss ? (metrics.avgWin / metrics.avgLoss).toFixed(2) : "0.00"} 
                    color="blue"
                  />
                  <MetricItem 
                    label="Consistency" 
                    value={`${((metrics.wins / metrics.totalTrades) * 100).toFixed(1)}%`} 
                    color="purple"
                  />
                </>
              )}
            </div>
          </div>

          {/* Win/Loss Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Win/Loss</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Trade outcomes</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs">Wins: {metrics?.wins || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-xs">Losses: {metrics?.losses || 0}</span>
                </div>
              </div>
            </div>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Wins", value: metrics?.wins || 0, color: "#10b981" },
                      { name: "Losses", value: metrics?.losses || 0, color: "#ef4444" },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="wins" fill="#10b981" />
                    <Cell key="losses" fill="#ef4444" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Trades Section */}
        {recentTrades.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Trades</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Latest journal entries</p>
              </div>
              <Link 
                to="/trades" 
                className="text-sm text-blue-600 dark:text-blue-400"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {recentTrades.slice(0, 3).map((trade, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${trade.pnl >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {trade.pnl >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{trade.symbol || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {trade.setup || 'No setup'} • {new Date(trade.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${trade.pnl?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily PnL Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daily Performance</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Last 7 days PnL</p>
            </div>
            <button className="text-xs text-blue-600 dark:text-blue-400">
              Details
            </button>
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyPnLData}>
                <Bar 
                  dataKey="pnl" 
                  fill="url(#dailyBar)" 
                  radius={[2, 2, 0, 0]}
                />
                <defs>
                  <linearGradient id="dailyBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'PnL']}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Symbol Performance */}
        {symbolPerformance.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Symbols</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">Best performing instruments</p>
              </div>
              <Globe className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              {symbolPerformance.map((symbol, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {symbol.symbol.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{symbol.symbol}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {symbol.trades} trades
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${symbol.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${symbol.pnl?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/trades"
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 rounded-lg font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Add More Trades
              </Link>
            </div>
          </div>
        )}

        {/* Empty State */}
        {recentTrades.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Start Your Trading Journal
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your first trade to see analytics and track your performance
            </p>
            <Link
              to="/trades?action=new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold"
            >
              <PlusCircle className="w-5 h-5" />
              Log Your First Trade
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-around px-4 py-3">
          <Link 
            to="/dashboard" 
            className="flex flex-col items-center text-blue-600 dark:text-blue-400"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link 
            to="/replay" 
            className="flex flex-col items-center text-gray-600 dark:text-gray-400"
          >
            <PlayCircle className="w-5 h-5" />
            <span className="text-xs mt-1">Replay</span>
          </Link>
          <Link 
            to="/trades?action=new" 
            className="flex flex-col items-center text-green-600 dark:text-green-400"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-xs mt-1">New Trade</span>
          </Link>
          <Link 
            to="/trades" 
            className="flex flex-col items-center text-gray-600 dark:text-gray-400"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs mt-1">Journal</span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center text-gray-600 dark:text-gray-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile Optimized Stat Card
function StatCard({ title, value, change, icon, color, trend, mobile }: any) {
  const colorClasses = {
    green: "bg-green-500/10 text-green-600 dark:text-green-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 ${mobile ? 'min-h-0' : ''}`}>
      <div className="flex items-start justify-between">
        <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-2`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↗' : '↘'}
          </div>
        )}
      </div>
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</div>
      <div className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate">{value}</div>
      {change && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{change}</div>
      )}
    </div>
  );
}

// Metric Item Component
function MetricItem({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`font-medium ${
        color === 'green' ? 'text-green-500' :
        color === 'red' ? 'text-red-500' :
        color === 'blue' ? 'text-blue-500' :
        'text-purple-500'
      }`}>
        {value}
      </span>
    </div>
  );
}