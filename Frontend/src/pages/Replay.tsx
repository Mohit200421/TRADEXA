import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  createChart,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type UTCTimestamp,
  type LineData,
} from "lightweight-charts";

/* -------------------- Suggestions -------------------- */
const CRYPTO_SUGGESTIONS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT"];
const FOREX_SUGGESTIONS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "XAU/USD"];

type MarketType = "CRYPTO" | "FOREX";

/* -------------------- Drawing Tools -------------------- */
type DrawingTool = "cursor" | "trendline" | "ray" | "hline" | "rectangle" | "delete";
type DrawingType = "trendline" | "ray" | "hline" | "rectangle";

type Drawing = {
  id: string;
  type: DrawingType;
  points: Array<{ time: UTCTimestamp; price: number }>;
};

/* -------------------- Chart Settings -------------------- */
type ChartSettings = {
  background: string;
  textColor: string;
  gridColor: string;
  borderColor: string;
  crosshair: boolean;

  upColor: string;
  downColor: string;

  wickUpColor: string;
  wickDownColor: string;

  borderUpColor: string;
  borderDownColor: string;
};

const DEFAULT_SETTINGS: ChartSettings = {
  background: "#0b1220",
  textColor: "#cbd5e1",
  gridColor: "rgba(148,163,184,0.08)",
  borderColor: "rgba(148,163,184,0.25)",
  crosshair: true,

  upColor: "#22c55e",
  downColor: "#ef4444",

  wickUpColor: "#22c55e",
  wickDownColor: "#ef4444",

  borderUpColor: "#22c55e",
  borderDownColor: "#ef4444",
};

const SETTINGS_KEY = "tradefx_chart_settings_v2";

function loadSettings(): ChartSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: ChartSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function formatCandleTime(ts?: UTCTimestamp) {
  if (!ts) return "--";
  const d = new Date(ts * 1000);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* -------------------- Indicators -------------------- */
type IndicatorConfig = {
  ema: {
    enabled: boolean;
    period: number;
    color: string;
  };
  rsi: {
    enabled: boolean;
    length: number;
    color: string;
  };
};

const DEFAULT_INDICATORS: IndicatorConfig = {
  ema: {
    enabled: false,
    period: 21,
    color: "#38bdf8",
  },
  rsi: {
    enabled: false,
    length: 14,
    color: "#a78bfa",
  },
};

function calcEMA(values: number[], period: number) {
  if (!values.length) return [];
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = values[0];
  ema.push(prev);
  for (let i = 1; i < values.length; i++) {
    const cur = values[i] * k + prev * (1 - k);
    ema.push(cur);
    prev = cur;
  }
  return ema;
}

function calcRSI(values: number[], period = 14) {
  if (values.length < period + 1) return [];
  const rsi: number[] = new Array(values.length).fill(NaN);

  let gain = 0;
  let loss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gain += diff;
    else loss += Math.abs(diff);
  }

  gain /= period;
  loss /= period;

  let rs = loss === 0 ? 100 : gain / loss;
  rsi[period] = 100 - 100 / (1 + rs);

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? Math.abs(diff) : 0;

    gain = (gain * (period - 1) + g) / period;
    loss = (loss * (period - 1) + l) / period;

    rs = loss === 0 ? 100 : gain / loss;
    rsi[i] = 100 - 100 / (1 + rs);
  }

  return rsi;
}

export default function Replay() {
  /* -------------------- Refs -------------------- */
  const chartRef = useRef<HTMLDivElement | null>(null);
  const rsiChartRef = useRef<HTMLDivElement | null>(null);

  const chartApiRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiChartApiRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const drawingSeriesMapRef = useRef<Record<string, ISeriesApi<"Line">>>({});

  /* -------------------- State -------------------- */
  const [market, setMarket] = useState<MarketType>("CRYPTO");
  const [symbolInput, setSymbolInput] = useState("BTCUSDT");
  const [interval, setIntervalValue] = useState("1D");
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(80);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [isTyping, setIsTyping] = useState(false);
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false);
  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const [indicatorSettingsOpen, setIndicatorSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<ChartSettings>(() => loadSettings());
  const [indicators, setIndicators] = useState<IndicatorConfig>(() => DEFAULT_INDICATORS);
  const [activeTool, setActiveTool] = useState<DrawingTool>("cursor");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [pendingPoint, setPendingPoint] = useState<{ time: UTCTimestamp; price: number } | null>(null);
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ open: boolean; x: number; y: number }>({
    open: false,
    x: 0,
    y: 0,
  });

  /* -------------------- Derived -------------------- */
  const suggestions = useMemo(() => {
    const list = market === "CRYPTO" ? CRYPTO_SUGGESTIONS : FOREX_SUGGESTIONS;
    const q = symbolInput.trim().toUpperCase();
    if (!q) return list;
    return list.filter((s) => s.toUpperCase().includes(q)).slice(0, 8);
  }, [market, symbolInput]);

  const currentCandle = useMemo(() => {
    if (!candles.length) return null;
    const idx = Math.min(Math.max(0, visibleIndex - 1), candles.length - 1);
    return candles[idx] || null;
  }, [candles, visibleIndex]);

  const showDropdown = isTyping && suggestions.length > 1;

  /* -------------------- Mobile Detection -------------------- */
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  /* -------------------- Fetch Candles -------------------- */
  const fetchCryptoCandles = async (symbol: string) => {
    const map: any = {
      "1m": "1m",
      "5m": "5m",
      "15m": "15m",
      "1h": "1h",
      "4h": "4h",
      "1D": "1d",
    };

    const binanceInterval = map[interval] || "1d";
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${binanceInterval}&limit=500`;
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid crypto symbol");

    return data.map((c: any) => ({
      time: (c[0] / 1000) as UTCTimestamp,
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
    })) as CandlestickData[];
  };

  const fetchForexCandles = async (symbol: string) => {
    const apiKey = import.meta.env.VITE_TWELVE_API_KEY;
    if (!apiKey) throw new Error("TwelveData API key missing (VITE_TWELVE_API_KEY)");

    const mapInterval: any = {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "1h": "1h",
      "4h": "4h",
      "1D": "1day",
    };

    const tdInterval = mapInterval[interval] || "1day";
    const forexSymbol = symbol.trim().toUpperCase();

    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
      forexSymbol
    )}&interval=${tdInterval}&outputsize=300&apikey=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data?.status === "error") throw new Error(data?.message || "Invalid forex symbol");
    if (!data?.values) throw new Error("No candle data found");

    return data.values.reverse().map((c: any) => ({
      time: Math.floor(new Date(c.datetime).getTime() / 1000) as UTCTimestamp,
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
    })) as CandlestickData[];
  };

  const loadData = async () => {
    try {
      const finalSymbol =
        market === "CRYPTO"
          ? symbolInput.trim().toUpperCase().replace("/", "")
          : symbolInput.trim().toUpperCase();

      if (!finalSymbol) return;

      setPlaying(false);
      toast.loading("Loading candles...", { id: "load" });

      let formatted: CandlestickData[] = [];
      if (market === "CRYPTO") formatted = await fetchCryptoCandles(finalSymbol);
      else formatted = await fetchForexCandles(finalSymbol);

      setCandles(formatted);
      setVisibleIndex(Math.min(80, formatted.length));
      setPendingPoint(null);
      setSelectedDrawingId(null);

      toast.success("Candles loaded ✅", { id: "load" });
    } catch (err: any) {
      toast.error(err.message || "Failed to load candles ❌", { id: "load" });
    }
  };

  useEffect(() => {
    const t = setTimeout(() => loadData(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolInput, interval, market]);

  /* -------------------- Chart Initialization -------------------- */
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: isMobile ? 400 : 560,
      layout: {
        background: { color: settings.background },
        textColor: settings.textColor,
      },
      grid: {
        vertLines: { color: settings.gridColor },
        horzLines: { color: settings.gridColor },
      },
      rightPriceScale: { borderColor: settings.borderColor },
      timeScale: {
        borderColor: settings.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: settings.crosshair
        ? {
            mode: CrosshairMode.Normal,
            vertLine: { width: 1, color: "rgba(148,163,184,0.35)", style: LineStyle.Solid },
            horzLine: { width: 1, color: "rgba(148,163,184,0.35)", style: LineStyle.Solid },
          }
        : { mode: CrosshairMode.Hidden },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: settings.upColor,
      downColor: settings.downColor,
      wickUpColor: settings.wickUpColor,
      wickDownColor: settings.wickDownColor,
      borderUpColor: settings.borderUpColor,
      borderDownColor: settings.borderDownColor,
    });

    chartApiRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      chart.applyOptions({ 
        width: chartRef.current?.clientWidth || 900,
        height: isMobile ? 400 : 560 
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!rsiChartRef.current || !indicators.rsi.enabled) return;

    const rsiChart = createChart(rsiChartRef.current, {
      width: rsiChartRef.current.clientWidth,
      height: 150,
      layout: {
        background: { color: settings.background },
        textColor: settings.textColor,
      },
      grid: {
        vertLines: { color: settings.gridColor },
        horzLines: { color: settings.gridColor },
      },
      rightPriceScale: { borderColor: settings.borderColor },
      timeScale: {
        borderColor: settings.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: { mode: CrosshairMode.Hidden },
    });

    const rsiSeries = rsiChart.addLineSeries({
      lineWidth: 2,
      color: indicators.rsi.color,
    });

    rsiChartApiRef.current = rsiChart;
    rsiSeriesRef.current = rsiSeries;

    const handleResize = () =>
      rsiChart.applyOptions({ width: rsiChartRef.current?.clientWidth || 900 });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      rsiChart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indicators.rsi.enabled]);

  /* -------------------- Apply Settings -------------------- */
  useEffect(() => {
    const chart = chartApiRef.current;
    const candle = candleSeriesRef.current;
    if (!chart || !candle) return;

    chart.applyOptions({
      layout: { background: { color: settings.background }, textColor: settings.textColor },
      grid: { vertLines: { color: settings.gridColor }, horzLines: { color: settings.gridColor } },
      rightPriceScale: { borderColor: settings.borderColor },
      timeScale: { borderColor: settings.borderColor, timeVisible: true, secondsVisible: false },
      crosshair: settings.crosshair
        ? {
            mode: CrosshairMode.Normal,
            vertLine: { width: 1, color: "rgba(148,163,184,0.35)", style: LineStyle.Solid },
            horzLine: { width: 1, color: "rgba(148,163,184,0.35)", style: LineStyle.Solid },
          }
        : { mode: CrosshairMode.Hidden },
    });

    candle.applyOptions({
      upColor: settings.upColor,
      downColor: settings.downColor,
      wickUpColor: settings.wickUpColor,
      wickDownColor: settings.wickDownColor,
      borderUpColor: settings.borderUpColor,
      borderDownColor: settings.borderDownColor,
    });

    saveSettings(settings);
  }, [settings]);

  /* -------------------- Replay Engine -------------------- */
  useEffect(() => {
    if (!playing) return;
    if (!candles.length) return;

    const timer = setInterval(() => {
      setVisibleIndex((prev) => {
        if (prev >= candles.length) {
          setPlaying(false);
          toast.success("Replay finished ✅");
          return prev;
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [playing, speed, candles.length]);

  useEffect(() => {
    if (!candles.length) return;

    const slice = candles.slice(0, Math.min(visibleIndex, candles.length));
    candleSeriesRef.current?.setData(slice);
    chartApiRef.current?.timeScale().scrollToRealTime();
    updateIndicators(slice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, visibleIndex, indicators]);

  const updateIndicators = (slice: CandlestickData[]) => {
    if (!slice.length) return;
    const closes = slice.map((c) => c.close);

    if (!indicators.ema.enabled) {
      if (emaSeriesRef.current) {
        chartApiRef.current?.removeSeries(emaSeriesRef.current);
        emaSeriesRef.current = null;
      }
    } else {
      if (!emaSeriesRef.current) {
        emaSeriesRef.current = chartApiRef.current!.addLineSeries({
          lineWidth: 2,
          color: indicators.ema.color,
        });
      } else {
        emaSeriesRef.current.applyOptions({ color: indicators.ema.color });
      }

      const emaArr = calcEMA(closes, indicators.ema.period);
      const emaData: LineData[] = slice.map((c, i) => ({
        time: c.time,
        value: emaArr[i],
      }));
      emaSeriesRef.current.setData(emaData);
    }

    if (!indicators.rsi.enabled) {
      rsiSeriesRef.current?.setData([]);
      return;
    }

    rsiSeriesRef.current?.applyOptions({ color: indicators.rsi.color });
    const rsiArr = calcRSI(closes, indicators.rsi.length);
    const rsiData: LineData[] = slice
      .map((c, i) => ({
        time: c.time,
        value: Number.isFinite(rsiArr[i]) ? rsiArr[i] : NaN,
      }))
      .filter((x) => Number.isFinite(x.value));

    rsiSeriesRef.current?.setData(rsiData);
  };

  const clearIndicators = () => {
    setIndicators(DEFAULT_INDICATORS);
    toast.success("Indicators cleared ✅");
  };

  /* -------------------- Mobile Drawing Tools -------------------- */
  const DrawingToolsMobile = () => (
    <div className="fixed bottom-20 right-4 z-40">
      <div className="flex flex-col gap-2 bg-[#0f172a] border border-white/10 rounded-xl p-2 shadow-xl">
        {[
          { tool: "cursor", icon: "🖱️", label: "Cursor" },
          { tool: "trendline", icon: "📈", label: "Trend" },
          { tool: "ray", icon: "➡️", label: "Ray" },
          { tool: "hline", icon: "➖", label: "H Line" },
          { tool: "rectangle", icon: "▭", label: "Box" },
          { tool: "delete", icon: "🗑️", label: "Delete" },
        ].map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool as DrawingTool)}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-sm ${
              activeTool === tool ? "bg-sky-500/20 border border-sky-500/30" : "bg-white/5 hover:bg-white/10"
            }`}
            title={label}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200 pb-20 md:pb-12">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-[#070b14] border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
            <div className="font-bold text-base">TradeFX</div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaying((p) => !p)}
              disabled={!candles.length}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                playing 
                  ? "bg-amber-600 hover:bg-amber-700" 
                  : "bg-emerald-600 hover:bg-emerald-700"
              } disabled:opacity-50`}
            >
              {playing ? "⏸️" : "▶️"}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#0f172a] border-b border-white/10 px-4 py-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select
                className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm"
                value={market}
                onChange={(e) => {
                  const newMarket = e.target.value as MarketType;
                  setMarket(newMarket);
                  if (newMarket === "CRYPTO") setSymbolInput("BTCUSDT");
                  else setSymbolInput("XAU/USD");
                }}
              >
                <option value="FOREX">FOREX</option>
                <option value="CRYPTO">CRYPTO</option>
              </select>

              <select
                className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm"
                value={interval}
                onChange={(e) => setIntervalValue(e.target.value)}
              >
                <option value="1D">1D</option>
                <option value="4h">4h</option>
                <option value="1h">1h</option>
                <option value="15m">15m</option>
                <option value="5m">5m</option>
                <option value="1m">1m</option>
              </select>
            </div>

            <div className="relative">
              <input
                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm"
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value)}
                placeholder={market === "CRYPTO" ? "BTCUSDT" : "XAU/USD"}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setChartSettingsOpen(true)}
                className="flex-1 bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-sm"
              >
                ⚙ Settings
              </button>
              <button
                onClick={() => setIndicatorsOpen((p) => !p)}
                className="flex-1 bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-sm"
              >
                📊 Indicators
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setVisibleIndex(80)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 px-3 py-2 rounded-lg text-sm font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setVisibleIndex((p) => Math.min(p + 1, candles.length))}
                disabled={!candles.length}
                className="flex-1 bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                Next →
              </button>
            </div>

            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-slate-400 mb-2">Replay Speed</div>
              <div className="flex gap-2">
                {[1200, 600, 250, 100].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      speed === s 
                        ? "bg-sky-500 text-white" 
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {s === 1200 ? "Slow" : s === 600 ? "Norm" : s === 250 ? "Fast" : "Ultra"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-0 z-50 bg-[#070b14] border-b border-white/10 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg tracking-wide">TradeFX Chart Replay</div>

          <select
            className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm"
            value={market}
            onChange={(e) => {
              const newMarket = e.target.value as MarketType;
              setMarket(newMarket);
              if (newMarket === "CRYPTO") setSymbolInput("BTCUSDT");
              else setSymbolInput("XAU/USD");
            }}
          >
            <option value="FOREX">FOREX</option>
            <option value="CRYPTO">CRYPTO</option>
          </select>

          <div className="relative">
            <input
              className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm w-48"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              placeholder={market === "CRYPTO" ? "BTCUSDT" : "XAU/USD"}
            />
          </div>

          <select
            className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm"
            value={interval}
            onChange={(e) => setIntervalValue(e.target.value)}
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1D">1D</option>
          </select>

          <button
            onClick={() => setChartSettingsOpen(true)}
            className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            ⚙ Settings
          </button>

          <button
            onClick={() => setIndicatorsOpen((p) => !p)}
            className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
          >
            📊 Indicators
          </button>

          <div className="ml-auto flex items-center gap-3">
            <select
              className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-sm"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={1200}>Slow</option>
              <option value={600}>Normal</option>
              <option value={250}>Fast</option>
              <option value={100}>Ultra</option>
            </select>

            <button
              onClick={() => setPlaying((p) => !p)}
              disabled={!candles.length}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                playing 
                  ? "bg-amber-600 hover:bg-amber-700" 
                  : "bg-emerald-600 hover:bg-emerald-700"
              } disabled:opacity-50`}
            >
              {playing ? (
                <>
                  <span>⏸️ Pause</span>
                </>
              ) : (
                <>
                  <span>▶️ Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => setVisibleIndex((p) => Math.min(p + 1, candles.length))}
              disabled={!candles.length}
              className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Next →
            </button>

            <button
              onClick={() => setVisibleIndex(80)}
              disabled={!candles.length}
              className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        {/* Desktop Drawing Tools */}
        <div className="hidden md:flex w-16 bg-[#070b14] border-r border-white/10 flex-col items-center py-6 gap-4">
          {[
            { tool: "cursor", icon: "🖱️", label: "Cursor" },
            { tool: "trendline", icon: "📈", label: "Trend" },
            { tool: "ray", icon: "➡️", label: "Ray" },
            { tool: "hline", icon: "➖", label: "H Line" },
            { tool: "rectangle", icon: "▭", label: "Box" },
            { tool: "delete", icon: "🗑️", label: "Delete" },
          ].map(({ tool, icon, label }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool as DrawingTool)}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-sm ${
                activeTool === tool 
                  ? "bg-sky-500/20 border border-sky-500/30" 
                  : "bg-white/5 hover:bg-white/10"
              }`}
              title={label}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs mt-1">{label}</span>
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="flex-1 p-3 md:p-6">
          {/* Chart Container */}
          <div className="bg-[#070b14] rounded-xl shadow-lg border border-white/10 overflow-hidden mb-4">
            <div ref={chartRef} />
            
            {/* Chart Controls */}
            <div className="absolute top-4 left-4 z-30">
              <div className="flex flex-col md:flex-row gap-2">
                <button
                  onClick={() => chartApiRef.current?.timeScale().zoomOut()}
                  className="w-10 h-10 rounded-lg bg-black/80 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                >
                  −
                </button>
                <button
                  onClick={() => chartApiRef.current?.timeScale().zoomIn()}
                  className="w-10 h-10 rounded-lg bg-black/80 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                >
                  +
                </button>
                <button
                  onClick={() => chartApiRef.current?.timeScale().scrollToPosition(-30, false)}
                  className="w-10 h-10 rounded-lg bg-black/80 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                >
                  ‹
                </button>
                <button
                  onClick={() => chartApiRef.current?.timeScale().scrollToPosition(30, false)}
                  className="w-10 h-10 rounded-lg bg-black/80 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          {/* RSI Chart */}
          {indicators.rsi.enabled && (
            <div className="bg-[#070b14] rounded-xl shadow-lg border border-white/10 overflow-hidden">
              <div className="px-4 py-3 text-sm text-slate-400 border-b border-white/10">
                RSI ({indicators.rsi.length})
              </div>
              <div ref={rsiChartRef} />
            </div>
          )}

          {/* Current Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="bg-[#070b14] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Time</div>
              <div className="text-sm font-semibold">{formatCandleTime(currentCandle?.time as any)}</div>
            </div>
            <div className="bg-[#070b14] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Open</div>
              <div className="text-sm font-semibold text-slate-100">
                {currentCandle?.open?.toFixed?.(2) ?? "--"}
              </div>
            </div>
            <div className="bg-[#070b14] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">High</div>
              <div className="text-sm font-semibold text-emerald-400">
                {currentCandle?.high?.toFixed?.(2) ?? "--"}
              </div>
            </div>
            <div className="bg-[#070b14] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Low</div>
              <div className="text-sm font-semibold text-rose-400">
                {currentCandle?.low?.toFixed?.(2) ?? "--"}
              </div>
            </div>
            <div className="bg-[#070b14] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Close</div>
              <div className="text-sm font-semibold text-slate-100">
                {currentCandle?.close?.toFixed?.(2) ?? "--"}
              </div>
            </div>
            <div className="bg-[#070b14] border border-white/10 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400 mb-1">Progress</div>
              <div className="text-sm font-semibold">
                {Math.min(visibleIndex, candles.length)} / {candles.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawing Tools */}
      {isMobile && <DrawingToolsMobile />}

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14] border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <div className="text-slate-400">{market} • {symbolInput.toUpperCase()}</div>
            <div className="text-slate-300">{interval}</div>
          </div>
          <div className="text-xs text-slate-300">
            {Math.min(visibleIndex, candles.length)} / {candles.length || 0}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Chart Settings Modal */}
      {chartSettingsOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0b1220] border border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0b1220] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="font-semibold text-lg">Chart Settings</div>
              <button
                onClick={() => setChartSettingsOpen(false)}
                className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="text-sm font-medium">Colors</div>
                  {[
                    { label: "Background", key: "background" },
                    { label: "Text", key: "textColor" },
                    { label: "Grid", key: "gridColor" },
                    { label: "Border", key: "borderColor" },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-slate-400">{label}</label>
                      <input
                        type="color"
                        value={settings[key as keyof ChartSettings] as string}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, [key]: e.target.value }))
                        }
                        className="w-12 h-8 rounded bg-transparent border border-white/10"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-medium">Candle Colors</div>
                  {[
                    { label: "Bull Body", key: "upColor" },
                    { label: "Bull Wick", key: "wickUpColor" },
                    { label: "Bull Border", key: "borderUpColor" },
                    { label: "Bear Body", key: "downColor" },
                    { label: "Bear Wick", key: "wickDownColor" },
                    { label: "Bear Border", key: "borderDownColor" },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-slate-400">{label}</label>
                      <input
                        type="color"
                        value={settings[key as keyof ChartSettings] as string}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, [key]: e.target.value }))
                        }
                        className="w-12 h-8 rounded bg-transparent border border-white/10"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <div className="font-medium">Crosshair</div>
                  <div className="text-sm text-slate-400">Show crosshair on chart</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.crosshair}
                    onChange={(e) => setSettings((p) => ({ ...p, crosshair: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSettings(DEFAULT_SETTINGS)}
                  className="flex-1 bg-white/10 hover:bg-white/15 px-4 py-3 rounded-lg text-sm"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => {
                    saveSettings(settings);
                    toast.success("Settings saved ✅");
                    setChartSettingsOpen(false);
                  }}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 px-4 py-3 rounded-lg text-sm font-semibold"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicators Modal */}
      {indicatorsOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0b1220] border border-white/10 rounded-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="font-semibold text-lg">Indicators</div>
              <button
                onClick={() => setIndicatorsOpen(false)}
                className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium">EMA</div>
                    <div className="text-sm text-slate-400">Exponential Moving Average</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={indicators.ema.enabled}
                      onChange={(e) =>
                        setIndicators((p) => ({
                          ...p,
                          ema: { ...p.ema, enabled: e.target.checked },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <div className="font-medium">RSI</div>
                    <div className="text-sm text-slate-400">Relative Strength Index</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={indicators.rsi.enabled}
                      onChange={(e) =>
                        setIndicators((p) => ({
                          ...p,
                          rsi: { ...p.rsi, enabled: e.target.checked },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIndicators(DEFAULT_INDICATORS);
                    toast.success("Indicators reset ✅");
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/15 px-4 py-3 rounded-lg text-sm"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    setIndicatorsOpen(false);
                    toast.success("Indicators updated ✅");
                  }}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 px-4 py-3 rounded-lg text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}