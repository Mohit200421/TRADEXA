import { useEffect, useState } from "react";
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
} from "recharts";
import API from "../api/axios";
import { useJournals } from "../contexts/JournalContext";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
  symbol: string;
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
    totalTrades: number;
  };
}

export default function EquityCurveChart() {
  const [data, setData] = useState<EquityCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedJournal } = useJournals();

  useEffect(() => {
    const fetchEquityCurve = async () => {
      try {
        setLoading(true);
        setError(null);
        const journalId = selectedJournal?._id || "all";
        const res = await API.get(`/analytics/equity-curve/${journalId}`);
        setData(res.data);
      } catch (err: any) {
        console.error("Failed to fetch equity curve:", err);
        setError("Failed to load equity curve");
      } finally {
        setLoading(false);
      }
    };

    fetchEquityCurve();
  }, [selectedJournal]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="card p-6 dark:bg-black dark:border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data || data.equityCurve.length === 0) {
    return (
      <div className="card p-6 dark:bg-black dark:border-gray-800">
        <h3 className="font-semibold text-lg mb-4 dark:text-white">Equity Curve</h3>
        <div className="flex flex-col items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
          <p>No trade data available</p>
          <p className="text-sm">Add some trades to see your equity curve</p>
        </div>
      </div>
    );
  }

  const { equityCurve, summary } = data;

  return (
    <div className="card p-4 sm:p-6 dark:bg-black dark:border-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-lg dark:text-white">Equity Curve</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Account growth over time
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {summary.totalReturn >= 0 ? "+" : ""}
              {summary.totalReturn.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium dark:text-white">
              {formatCurrency(summary.finalEquity)}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={equityCurve}
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
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11 }}
              stroke="#9CA3AF"
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11 }}
              stroke="#9CA3AF"
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              width={70}
              domain={["dataMin - 100", "dataMax + 100"]}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const chartData = payload[0].payload;
                  const dateLabel = label as string;
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {new Date(dateLabel).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm font-semibold dark:text-white">
                        Equity: {formatCurrency(chartData.equity)}
                      </p>
                      <p
                        className={`text-xs ${
                          chartData.pnl >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        Trade P&L: {chartData.pnl >= 0 ? "+" : ""}
                        {formatCurrency(chartData.pnl)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

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
    </div>
  );
}

