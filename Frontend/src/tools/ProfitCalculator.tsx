import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Calculator,
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
  Zap,
  ChevronDown,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculateProfit, INSTRUMENTS } from "../utils/profitCalculator";
import toast from "react-hot-toast";

export default function ProfitCalculator() {
  const navigate = useNavigate();

  const [symbol, setSymbol] = useState("XAUUSD");
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [lotSize, setLotSize] = useState("0.1");
  const [balance, setBalance] = useState("10000");

  const result = useMemo(() => {
    if (!entry || !exit || !lotSize) return null;

    try {
      const calc = calculateProfit({
        symbol,
        type: direction,
        entryPrice: Number(entry),
        exitPrice: Number(exit),
        lotSize: Number(lotSize),
      });

      const percent =
        balance && Number(balance)
          ? (calc.pnl / Number(balance)) * 100
          : 0;

      return {
        ...calc,
        percent,
      };
    } catch (err: any) {
      toast.error(err.message);
      return null;
    }
  }, [entry, exit, lotSize, direction, symbol, balance]);

  const isProfit = result && result.pnl >= 0;

  const resetForm = () => {
    setSymbol("XAUUSD");
    setDirection("BUY");
    setEntry("");
    setExit("");
    setLotSize("0.1");
    setBalance("10000");
  };

  const quickSetLots = (value: string) => {
    setLotSize(value);
  };

  const quickSetBalance = (value: string) => {
    setBalance(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
            <Calculator className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Profit Calculator</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accurate P&L calculation based on real contract sizes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/tools")}
            className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Tools</span>
          </button>
          <button
            onClick={resetForm}
            className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Repeat className="w-4 h-4" />
            <span className="hidden sm:inline">Reset All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* INPUTS SECTION */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Trade Parameters</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter your trade details</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Instrument Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trading Instrument
                </label>
                <div className="relative">
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
                  >
                    {Object.keys(INSTRUMENTS).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the trading pair or instrument
                </p>
              </div>

              {/* Direction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trade Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["BUY", "SELL"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDirection(d as any)}
                      className={`py-2.5 sm:py-3 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        direction === d
                          ? d === "BUY"
                            ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                            : "bg-red-500 border-red-500 text-white shadow-sm"
                          : "border-gray-300 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                      }`}
                    >
                      {d === "BUY" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="1850.50"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Current market entry price
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exit Price
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={exit}
                    onChange={(e) => setExit(e.target.value)}
                    placeholder="1865.75"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Target or stop loss price
                  </p>
                </div>
              </div>

              {/* Lot Size with Quick Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lot Size
                  </label>
                  <div className="flex items-center gap-1">
                    {["0.01", "0.1", "1.0"].map((value) => (
                      <button
                        key={value}
                        onClick={() => quickSetLots(value)}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          lotSize === value
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                            : "border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    placeholder="0.10"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <Zap className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  1.0 = Standard Lot (100,000 units)
                </p>
              </div>

              {/* Account Balance with Quick Options */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Account Balance
                  </label>
                  <div className="flex items-center gap-1">
                    {["1000", "5000", "10000"].map((value) => (
                      <button
                        key={value}
                        onClick={() => quickSetBalance(value)}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          balance === value
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                            : "border-gray-300 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900"
                        }`}
                      >
                        ${value}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="10000"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Helps calculate percentage impact (optional)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Calculation Result</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">P&L analysis based on your inputs</p>
              </div>
            </div>

            {!result ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enter Trade Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fill in the fields to calculate profit
                </p>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Required: Entry Price, Exit Price, Lot Size
                </div>
              </div>
            ) : (
              <>
                {/* Main Result Card - BLUE for PROFIT, RED for LOSS */}
                <div className={`rounded-2xl p-4 sm:p-6 text-center mb-4 sm:mb-6 transition-all duration-300 ${
                  isProfit
                    ? "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800"
                    : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800"
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {isProfit ? (
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-blue-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Total {isProfit ? "Profit" : "Loss"}
                    </span>
                  </div>
                  <p className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 ${
                    isProfit
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {isProfit ? "+" : "-"}${Math.abs(result.pnl).toFixed(2)}
                  </p>
                  <p className={`text-sm ${isProfit ? "text-blue-700 dark:text-blue-300" : "text-red-700 dark:text-red-300"}`}>
                    {isProfit ? "Profit" : "Loss"} calculated in USD
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <StatCard
                    label="Pips"
                    value={result.pips.toFixed(1)}
                    icon={<Target className="w-4 h-4" />}
                    color="blue"
                    tooltip="Price movement in pips"
                  />
                  <StatCard
                    label="Balance Impact"
                    value={`${result.percent.toFixed(2)}%`}
                    icon={<Percent className="w-4 h-4" />}
                    color={isProfit ? "blue" : "red"}
                    tooltip="Percentage of account affected"
                  />
                  <StatCard
                    label="Direction"
                    value={direction}
                    icon={direction === "BUY" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    color={direction === "BUY" ? "blue" : "red"}
                    tooltip="Trade direction"
                  />
                  <StatCard
                    label="Instrument"
                    value={symbol}
                    icon={<Zap className="w-4 h-4" />}
                    color="purple"
                    tooltip="Selected trading instrument"
                  />
                </div>

                {/* Trade Summary */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Entry Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">{entry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Exit Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">{exit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Lot Size</p>
                      <p className="font-medium text-gray-900 dark:text-white">{lotSize}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Account</p>
                      <p className="font-medium text-gray-900 dark:text-white">${balance}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Warning */}
                {Math.abs(result.percent) > 5 && (
                  <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border text-sm ${
                    isProfit
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                  }`}>
                    <div className="flex items-start gap-2">
                      {isProfit ? (
                        <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                      )}
                      <p>
                        This trade would impact your account by <span className="font-semibold">{Math.abs(result.percent).toFixed(2)}%</span>. 
                        {result.percent > 5 ? " Consider proper risk management." : " Manage your risk carefully."}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================
   COMPONENTS
===================== */

function StatCard({ label, value, icon, color = "blue", tooltip }: any) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400",
  };

  return (
    <div 
      className={`rounded-xl border p-3 sm:p-4 text-center transition-all hover:scale-[1.02] ${colorClasses[color]}`}
      title={tooltip}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-lg sm:text-xl font-bold">{value}</p>
    </div>
  );
}