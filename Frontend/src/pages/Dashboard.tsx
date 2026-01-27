import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { 
  TrendingUp, TrendingDown, DollarSign, Target, BarChart3, 
  Calendar, PieChart as PieChartIcon, LineChart as LineChartIcon,
  BarChart as BarChartIcon, Award, Trophy, Clock, TrendingUp as TrendingUpIcon,
  Users, Activity, Shield, ChevronRight, Zap, RefreshCw,
  Maximize2, Download, Filter, Settings, Bell, Search,
  ArrowUpRight, ArrowDownRight, Sparkles, Target as TargetIcon,
  Wallet, Globe, Cpu, Database, Cloud
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
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  getAnalyticsSummary,
  getEquityCurve,
  getMonthlyAnalytics,
  getAdvancedAnalytics,
} from "../services/tradeService";
import { useTheme } from "../contexts/ThemeContext";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [data, setData] = useState<any>(null);
  const [curve, setCurve] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [advanced, setAdvanced] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeMetric, setActiveMetric] = useState("equity");
  const dashboardRef = useRef(null);

  const fetchAnalytics = async () => {
    try {
      const [res, curveRes, monthlyRes, advRes] = await Promise.all([
        getAnalyticsSummary(),
        getEquityCurve(),
        getMonthlyAnalytics(),
        getAdvancedAnalytics()
      ]);

      setData(res.data);
      setCurve(curveRes.data);
      setMonthly(monthlyRes.data);
      setAdvanced(advRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your trading analytics...</p>
        </div>
      </div>
    );
  }

  // Mock data for enhanced visualizations
  const performanceMetrics = [
    { name: "Win Rate", value: data?.winRate || 0, target: 70, color: "#10b981" },
    { name: "Profit Factor", value: data?.profitFactor || 1.5, target: 2.0, color: "#3b82f6" },
    { name: "Risk/Reward", value: data?.riskReward || 1.5, target: 2.0, color: "#8b5cf6" },
    { name: "Avg Win/Loss", value: data?.avgWinLossRatio || 2.0, target: 3.0, color: "#f59e0b" },
  ];

  const dailyPnL = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    pnl: Math.random() * 2000 - 500,
    trades: Math.floor(Math.random() * 10) + 1,
  }));

  const symbolPerformance = advanced?.bestSymbols?.slice(0, 5) || [];
  const setupPerformance = advanced?.bestSetups?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back! Here's your performance overview.</p>
                </div>
              </div>

              {/* Time Range Selector */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {["7d", "30d", "90d", "1y", "All"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search metrics..."
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <button
                onClick={fetchAnalytics}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <Link
                to="/replay"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                <Zap className="w-4 h-4" />
                Bar Replay
              </Link>

              <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {theme === 'light' ? (
                  <Shield className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="p-4 md:p-6" ref={dashboardRef}>
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total PnL"
            value={`$${Number(data?.totalPnL || 0).toFixed(2)}`}
            change={data?.pnlChange || "+12.4%"}
            icon={<DollarSign className="w-6 h-6" />}
            color="green"
            trend="up"
          />
          <StatCard
            title="Win Rate"
            value={`${Number(data?.winRate || 0).toFixed(1)}%`}
            change={data?.winRateChange || "+4.2%"}
            icon={<Target className="w-6 h-6" />}
            color="blue"
            trend="up"
          />
          <StatCard
            title="Total Trades"
            value={data?.totalTrades || 0}
            change={`+${data?.tradesChange || 18}`}
            icon={<Activity className="w-6 h-6" />}
            color="purple"
            trend="up"
          />
          <StatCard
            title="Avg R:R"
            value={data?.riskReward || "1:1.8"}
            change={data?.rrChange || "+0.3"}
            icon={<TrendingUpIcon className="w-6 h-6" />}
            color="orange"
            trend="up"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Equity Curve */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-blue-500" />
                  Equity Curve
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your trading journey visualized</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {curve.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <LineChartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No data yet. Add trades to see your equity curve.</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={curve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="equity"
                      stroke="#3b82f6"
                      fill="url(#colorEquity)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5 text-green-500" />
                  Performance Metrics
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your key trading metrics</p>
              </div>
            </div>

            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{metric.name}</span>
                    <span className="text-sm font-bold" style={{ color: metric.color }}>
                      {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(metric.value / metric.target) * 100}%`,
                        backgroundColor: metric.color,
                        maxWidth: '100%'
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Target: {metric.target}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Performance */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Monthly Performance
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">PnL breakdown by month</p>
              </div>
            </div>

            {monthly.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No monthly data available</p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="month" stroke="rgba(148, 163, 184, 0.5)" />
                    <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        borderRadius: '0.75rem'
                      }}
                    />
                    <Bar
                      dataKey="pnl"
                      fill="url(#colorBar)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Win vs Loss Distribution */}
          {data && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-red-500" />
                    Win vs Loss Distribution
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Trade outcome analysis</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Wins", value: data.wins || 0, color: "#10b981" },
                        { name: "Losses", value: data.losses || 0, color: "#ef4444" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Wins", value: data.wins || 0, color: "#10b981" },
                        { name: "Losses", value: data.losses || 0, color: "#ef4444" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                        borderRadius: '0.75rem'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Analytics Grid */}
        {advanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Max Drawdown */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-400/20 backdrop-blur-sm rounded-2xl border border-blue-200/50 dark:border-blue-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingDown className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Max Drawdown</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Worst peak-to-trough decline</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {Number(advanced.maxDrawdown || 0).toFixed(2)}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Manage your risk exposure
              </div>
            </div>

            {/* Top Symbols */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Globe className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Top Symbols</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Best performing instruments</p>
                  </div>
                </div>
                <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {symbolPerformance.length}
                </div>
              </div>
              <div className="space-y-3">
                {symbolPerformance.length > 0 ? (
                  symbolPerformance.map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.pnl > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium">{s.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${s.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${Number(s.pnl || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">{s.trades} trades</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No symbol data available</p>
                )}
              </div>
            </div>

            {/* Top Setups */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Cpu className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Top Setups</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Most profitable strategies</p>
                  </div>
                </div>
                <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {setupPerformance.length}
                </div>
              </div>
              <div className="space-y-3">
                {setupPerformance.length > 0 ? (
                  setupPerformance.map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.pnl > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium truncate">{s.setup || `Setup ${idx + 1}`}</span>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${s.pnl > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ${Number(s.pnl || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">{s.trades} trades</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No setup data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Daily PnL */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Daily PnL Performance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last 30 days performance trend</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg">Line</button>
              <button className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">Bar</button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyPnL}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="day" stroke="rgba(148, 163, 184, 0.5)" />
                <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    borderRadius: '0.75rem'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pnl"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Award className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Best Trade</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${Number(data?.avgWin || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Worst Trade</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${Number(data?.avgLoss || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Wallet className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Profit Factor</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {data?.profitFactor?.toFixed(2) || "1.00"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Database className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {data?.consistency?.toFixed(1) || "75.0"}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Stat Card Component
function StatCard({ title, value, change, icon, color, trend }: any) {
  const colorClasses = {
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  return (
    <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <div className={`inline-flex p-3 rounded-xl ${colorClasses[color]} mb-4 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
        </div>
        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span className="text-sm font-medium">{change}</span>
        </div>
      </div>
    </div>
  );
}