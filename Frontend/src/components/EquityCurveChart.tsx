import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Brush,
} from "recharts";
import API from "../api/axios";
import { useJournals } from "../contexts/JournalContext";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  Calendar,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Activity,
  AlertCircle,
  Plus, // Added missing Plus import
} from "lucide-react";
import { format, subMonths, isAfter, isBefore } from "date-fns";

interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
  symbol: string;
  drawdown?: number;
  drawdownPercent?: number;
}

interface EquityCurveData {
  initialBalance: number;
  equityCurve: EquityPoint[];
  summary: {
    initialBalance: number;
    finalEquity: number;
    totalPnL: number;
    totalReturn: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
    maxDrawdownDate?: string;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    sharpeRatio?: number;
    winRate: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
  };
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

export default function EquityCurveChart() {
  const [data, setData] = useState<EquityCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedJournal } = useJournals();
  
  // UI States
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");
  const [showBrush, setShowBrush] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [chartHeight, setChartHeight] = useState(320);

  useEffect(() => {
    const fetchEquityCurve = async () => {
      try {
        setLoading(true);
        setError(null);
        const journalId = selectedJournal?._id || "all";
        const res = await API.get(`/analytics/equity-curve/${journalId}`);
        
        // Validate and sanitize data
        const responseData = res.data as EquityCurveData;
        if (responseData?.summary) {
          responseData.summary = {
            initialBalance: responseData.summary.initialBalance || 0,
            finalEquity: responseData.summary.finalEquity || 0,
            totalPnL: responseData.summary.totalPnL || 0,
            totalReturn: responseData.summary.totalReturn || 0,
            maxDrawdown: responseData.summary.maxDrawdown || 0,
            maxDrawdownPercent: responseData.summary.maxDrawdownPercent || 0,
            maxDrawdownDate: responseData.summary.maxDrawdownDate,
            totalTrades: responseData.summary.totalTrades || 0,
            winningTrades: responseData.summary.winningTrades || 0,
            losingTrades: responseData.summary.losingTrades || 0,
            sharpeRatio: responseData.summary.sharpeRatio,
            winRate: responseData.summary.winRate || 0,
            averageWin: responseData.summary.averageWin || 0,
            averageLoss: responseData.summary.averageLoss || 0,
            profitFactor: responseData.summary.profitFactor || 0,
          };
        }
        
        setData(responseData);
      } catch (err: any) {
        console.error("Failed to fetch equity curve:", err);
        setError("Failed to load equity curve");
      } finally {
        setLoading(false);
      }
    };

    fetchEquityCurve();
  }, [selectedJournal]);

  // Helper functions with safe value handling
  const safeNumber = (value: number | undefined | null, defaultValue = 0): number => {
    return value ?? defaultValue;
  };

  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCompactCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      compactDisplay: "short",
    }).format(value);
  };

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "MMM d");
    } catch {
      return "";
    }
  };

  const formatFullDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "EEE, MMM d, yyyy");
    } catch {
      return "";
    }
  };

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data?.equityCurve || timeRange === "ALL") return data?.equityCurve || [];
    
    const now = new Date();
    let cutoffDate = now;
    
    switch (timeRange) {
      case "1M":
        cutoffDate = subMonths(now, 1);
        break;
      case "3M":
        cutoffDate = subMonths(now, 3);
        break;
      case "6M":
        cutoffDate = subMonths(now, 6);
        break;
      case "1Y":
        cutoffDate = subMonths(now, 12);
        break;
    }
    
    return data.equityCurve.filter(point => 
      point?.date && isAfter(new Date(point.date), cutoffDate)
    );
  }, [data?.equityCurve, timeRange]);

  // Calculate metrics for filtered data
  const filteredMetrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;
    
    const startEquity = filteredData[0]?.equity ?? 0;
    const endEquity = filteredData[filteredData.length - 1]?.equity ?? 0;
    const totalReturn = startEquity !== 0 ? ((endEquity - startEquity) / startEquity) * 100 : 0;
    
    // Calculate max drawdown in filtered period
    let maxDrawdown = 0;
    let peak = startEquity;
    
    filteredData.forEach(point => {
      const equity = point?.equity ?? 0;
      if (equity > peak) {
        peak = equity;
      }
      const drawdown = peak - equity;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    return {
      startEquity,
      endEquity,
      totalReturn,
      maxDrawdown,
    };
  }, [filteredData]);

  const handleExportData = () => {
    if (!data?.equityCurve) return;
    
    const csvContent = [
      ["Date", "Equity", "P&L", "Symbol", "Drawdown", "Drawdown %"].join(","),
      ...data.equityCurve.map(point => 
        [
          point?.date || "",
          point?.equity ?? 0,
          point?.pnl ?? 0,
          point?.symbol || "",
          point?.drawdown ?? 0,
          point?.drawdownPercent ?? 0,
        ].join(",")
      ),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `equity-curve-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`card ${isExpanded ? 'fixed inset-4 z-50 overflow-auto' : ''} dark:bg-black dark:border-gray-800 transition-all duration-300`}>
        <div className="p-6">
          {/* Enhanced loading skeleton */}
          <div className="animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-6 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded"></div>
                <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded"></div>
              </div>
            </div>
            
            {/* Animated chart skeleton */}
            <div className="h-64 sm:h-80 relative">
              <div className="absolute inset-0 flex items-end gap-1">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-400/30 to-blue-500/30 dark:from-blue-600/20 dark:to-blue-500/20 rounded-t animate-pulse"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              {/* Floating chart icons */}
              <div className="absolute top-1/4 left-4 opacity-20">
                <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-3 w-16 mx-auto bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded mb-2"></div>
                  <div className="h-5 w-20 mx-auto bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Loading message */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              Loading equity curve data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data || !data.equityCurve || data.equityCurve.length === 0) {
    return (
      <div className={`card ${isExpanded ? 'fixed inset-4 z-50' : ''} p-6 dark:bg-black dark:border-gray-800`}>
        <h3 className="font-semibold text-lg mb-4 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Equity Curve
        </h3>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="relative">
            <TrendingUp className="w-16 h-16 mb-4 opacity-20" />
            <TrendingDown className="w-16 h-16 absolute top-0 left-0 opacity-20 rotate-180" />
          </div>
          <p className="text-lg font-medium mb-2">No trade data available</p>
          <p className="text-sm text-center max-w-md">
            Start adding trades to see your equity curve and track your performance over time.
          </p>
          <button 
            onClick={() => window.location.href = '/trades'}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Trade
          </button>
        </div>
      </div>
    );
  }

  const summary = data.summary;

  return (
    <div className={`card ${isExpanded ? 'fixed inset-4 z-50 overflow-auto' : ''} dark:bg-black dark:border-gray-800 transition-all duration-300`}>
      <div className="p-4 sm:p-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg dark:text-white flex items-center gap-2">
                Equity Curve
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  aria-label={isExpanded ? "Minimize" : "Expand"}
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Account growth over time · {filteredData.length} trades
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {(["1M", "3M", "6M", "1Y", "ALL"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeRange === range
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1">
              <button
                onClick={() => setShowBrush(!showBrush)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Toggle range selector"
                aria-label="Toggle range selector"
              >
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Toggle statistics"
                aria-label="Toggle statistics"
              >
                <Percent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleExportData}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Export data"
                aria-label="Export data"
              >
                <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Refresh"
                aria-label="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {/* Current Balance */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Current Balance</p>
              <p className="text-lg font-bold dark:text-white">
                {formatCompactCurrency(summary.finalEquity)}
              </p>
              <p className={`text-xs ${
                safeNumber(summary.totalReturn) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {safeNumber(summary.totalReturn) >= 0 ? "+" : ""}
                {safeNumber(summary.totalReturn).toFixed(2)}%
              </p>
            </div>

            {/* Total P&L */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total P&L</p>
              <p className={`text-lg font-bold ${
                safeNumber(summary.totalPnL) >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {safeNumber(summary.totalPnL) >= 0 ? "+" : ""}
                {formatCompactCurrency(summary.totalPnL)}
              </p>
              <p className="text-xs text-gray-500">
                {safeNumber(summary.winningTrades)}W / {safeNumber(summary.losingTrades)}L
              </p>
            </div>

            {/* Max Drawdown */}
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Max Drawdown</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                -{formatCompactCurrency(summary.maxDrawdown)}
              </p>
              <p className="text-xs text-gray-500">
                {safeNumber(summary.maxDrawdownPercent).toFixed(2)}%
              </p>
            </div>

            {/* Win Rate */}
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Win Rate</p>
              <p className="text-lg font-bold dark:text-white">
                {safeNumber(summary.winRate).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                PF: {safeNumber(summary.profitFactor).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-64 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#3B82F6"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#3B82F6"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#EF4444"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#EF4444"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
                strokeOpacity={0.5}
              />
              
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              
              <YAxis
                yAxisId="left"
                tickFormatter={formatCompactCurrency}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                width={60}
                domain={["auto", "auto"]}
              />
              
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${safeNumber(value).toFixed(1)}%`}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                stroke="#9CA3AF"
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                width={45}
                domain={["auto", "auto"]}
              />
              
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const chartData = payload[0]?.payload;
                    if (!chartData) return null;
                    
                    return (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[200px]">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {formatFullDate(label)}
                        </p>
                        
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Equity:</span>
                            <span className="text-sm font-semibold dark:text-white">
                              {formatCurrency(chartData.equity)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Trade P&L:</span>
                            <span className={`text-sm font-semibold ${
                              safeNumber(chartData.pnl) >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}>
                              {safeNumber(chartData.pnl) >= 0 ? "+" : ""}
                              {formatCurrency(chartData.pnl)}
                            </span>
                          </div>
                          
                          {chartData.symbol && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Symbol:</span>
                              <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                {chartData.symbol}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Return:</span>
                            <span className={`text-xs font-medium ${
                              data.initialBalance !== 0 && 
                              ((safeNumber(chartData.equity) - safeNumber(data.initialBalance)) / safeNumber(data.initialBalance) * 100) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}>
                              {data.initialBalance !== 0 
                                ? ((safeNumber(chartData.equity) - safeNumber(data.initialBalance)) / safeNumber(data.initialBalance) * 100).toFixed(1)
                                : "0"}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Reference line for initial balance */}
              <ReferenceLine
                y={safeNumber(data.initialBalance)}
                yAxisId="left"
                stroke="#9CA3AF"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                label={{
                  value: "Initial",
                  position: "insideBottomRight",
                  fill: "#6B7280",
                  fontSize: 10,
                }}
              />
              
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="equity"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#equityGradient)"
                activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Range selector brush */}
        {showBrush && data.equityCurve && (
          <div className="h-16 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.equityCurve}>
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
                <Brush
                  dataKey="date"
                  height={16}
                  stroke="#3B82F6"
                  fill="#E5E7EB"
                  tickFormatter={formatDate}
                  startIndex={filteredData.length > 0 ? 0 : undefined}
                  endIndex={filteredData.length - 1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Initial</p>
            <p className="font-semibold dark:text-white">
              {formatCurrency(summary.initialBalance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
            <p className="font-semibold dark:text-white">
              {formatCurrency(summary.finalEquity)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Max Drawdown</p>
            <p className="font-semibold text-red-500 dark:text-red-400">
              -{formatCurrency(summary.maxDrawdown)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Trades</p>
            <p className="font-semibold dark:text-white">{summary.totalTrades}</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Risk Metrics
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sharpe Ratio</p>
                <p className="text-sm font-semibold dark:text-white">
                  {summary.sharpeRatio ? summary.sharpeRatio.toFixed(2) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Max DD %</p>
                <p className="text-sm font-semibold text-red-500 dark:text-red-400">
                  {safeNumber(summary.maxDrawdownPercent).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Trade Stats
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Win</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  +{formatCompactCurrency(summary.averageWin)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Avg Loss</p>
                <p className="text-sm font-semibold text-red-500 dark:text-red-400">
                  -{formatCompactCurrency(summary.averageLoss)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Performance
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Profit Factor</p>
                <p className="text-sm font-semibold dark:text-white">
                  {safeNumber(summary.profitFactor).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                <p className="text-sm font-semibold dark:text-white">
                  {safeNumber(summary.winRate).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtered period summary */}
        {timeRange !== "ALL" && filteredMetrics && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {timeRange} Performance: 
              <span className={`ml-2 font-semibold ${
                safeNumber(filteredMetrics.totalReturn) >= 0 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {safeNumber(filteredMetrics.totalReturn) >= 0 ? "+" : ""}
                {safeNumber(filteredMetrics.totalReturn).toFixed(2)}%
              </span>
              <span className="mx-2">·</span>
              Max Drawdown: 
              <span className="ml-2 font-semibold text-red-500 dark:text-red-400">
                -{formatCompactCurrency(filteredMetrics.maxDrawdown)}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}