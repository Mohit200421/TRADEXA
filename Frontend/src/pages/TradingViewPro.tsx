import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Home, Settings, BarChart2, Download, Upload, Moon, Sun } from "lucide-react";
import { createChart, CrosshairMode, LineStyle, ColorType } from "lightweight-charts";
import { useTheme } from "../contexts/ThemeContext";

type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1D";
type ChartType = "candles" | "line" | "area";

const TradingViewPro = () => {
  const { theme, toggleTheme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [symbol, setSymbol] = useState("BTC/USD");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 600,
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme === 'dark' ? '#131722' : '#ffffff' 
        },
        textColor: theme === 'dark' ? '#d1d4dc' : '#333333',
      },
      grid: {
        vertLines: { 
          color: theme === 'dark' ? 'rgba(42, 46, 57, 0.6)' : 'rgba(0, 0, 0, 0.1)' 
        },
        horzLines: { 
          color: theme === 'dark' ? 'rgba(42, 46, 57, 0.6)' : 'rgba(0, 0, 0, 0.1)' 
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? 'rgba(42, 46, 57, 0.8)' : 'rgba(0, 0, 0, 0.2)',
      },
      timeScale: {
        borderColor: theme === 'dark' ? 'rgba(42, 46, 57, 0.8)' : 'rgba(0, 0, 0, 0.2)',
        timeVisible: true,
      },
    });

    chartRef.current = chart;

    // Generate sample data
    const now = Math.floor(Date.now() / 1000);
    const data = [];
    let price = 50000;
    
    for (let i = 0; i < 100; i++) {
      const time = (now - (100 - i) * 86400) as any;
      const change = (Math.random() - 0.5) * 0.1;
      const open = price;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      
      data.push({ time, open, high, low, close });
      price = close;
    }

    const candleSeries = chart.addCandlestickSeries({
      upColor: theme === 'dark' ? '#26a69a' : '#10b981',
      downColor: theme === 'dark' ? '#ef5350' : '#ef4444',
      borderVisible: false,
      wickUpColor: theme === 'dark' ? '#26a69a' : '#10b981',
      wickDownColor: theme === 'dark' ? '#ef5350' : '#ef4444',
    });

    candleSeries.setData(data);

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth || 800 });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update chart theme when theme changes
  useEffect(() => {
    if (!chartRef.current) return;
    
    chartRef.current.applyOptions({
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme === 'dark' ? '#131722' : '#ffffff' 
        },
        textColor: theme === 'dark' ? '#d1d4dc' : '#333333',
      },
      grid: {
        vertLines: { 
          color: theme === 'dark' ? 'rgba(42, 46, 57, 0.6)' : 'rgba(0, 0, 0, 0.1)' 
        },
        horzLines: { 
          color: theme === 'dark' ? 'rgba(42, 46, 57, 0.6)' : 'rgba(0, 0, 0, 0.1)' 
        },
      },
    });
  }, [theme]);

  const timeframes: { label: string; value: Timeframe }[] = [
    { label: "1m", value: "1m" },
    { label: "5m", value: "5m" },
    { label: "15m", value: "15m" },
    { label: "1h", value: "1h" },
    { label: "4h", value: "4h" },
    { label: "1D", value: "1D" },
  ];

  const symbols = ["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD", "EUR/USD", "GBP/USD"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <div className="flex items-center gap-4">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-gray-900 dark:text-white"
              >
                {symbols.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded">
                {timeframes.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => setTimeframe(tf.value)}
                    className={`px-3 py-1 ${timeframe === tf.value ? 'bg-blue-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("candles")}
                className={`px-3 py-1 rounded ${chartType === "candles" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
              >
                Candles
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded ${chartType === "line" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`px-3 py-1 rounded ${chartType === "area" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}
              >
                Area
              </button>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium"
            >
              {isPlaying ? "⏸️ Pause" : "▶️ Play"}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="p-6">
        <div ref={chartContainerRef} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" />
      </div>

      {/* Bottom Info */}
      <div className="px-6 pb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Symbol</div>
              <div className="font-bold text-gray-900 dark:text-white">{symbol}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Timeframe</div>
              <div className="font-bold text-gray-900 dark:text-white">{timeframe}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Chart Type</div>
              <div className="font-bold text-gray-900 dark:text-white">{chartType}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Status</div>
              <div className="font-bold text-gray-900 dark:text-white">{isPlaying ? "Playing" : "Paused"}</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
            <Link 
              to="/dashboard" 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-center"
            >
              Go to Dashboard
            </Link>
            <div className="flex gap-2 justify-center">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Upload className="w-4 h-4" />
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewPro;