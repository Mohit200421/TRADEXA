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
} from "lightweight-charts";

const CRYPTO_SUGGESTIONS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT"];
const FOREX_SUGGESTIONS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "XAU/USD"];

type MarketType = "CRYPTO" | "FOREX";
type ToolType = "cursor" | "trendline" | "hline" | "delete";
type TradeSide = "BUY" | "SELL";

type TradeMarker = {
  id: string;
  time: UTCTimestamp;
  side: TradeSide;
  price: number;
};

type ChartSettings = {
  theme: "dark" | "light";
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
  theme: "dark",
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

const SETTINGS_KEY = "tradefx_chart_settings_v1";

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

export default function Replay() {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const drawingSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [market, setMarket] = useState<MarketType>("CRYPTO");
  const [symbolInput, setSymbolInput] = useState("BTCUSDT");
  const [interval, setIntervalValue] = useState("1D");

  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(50);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);

  const [isTyping, setIsTyping] = useState(false);

  const [activeTool, setActiveTool] = useState<ToolType>("cursor");
  const [firstPoint, setFirstPoint] = useState<{ time: UTCTimestamp; price: number } | null>(null);

  const [trades, setTrades] = useState<TradeMarker[]>([]);

  // Bottom bar info (TV-like)
  const currentCandle = useMemo(() => {
    if (!candles.length) return null;
    const idx = Math.min(Math.max(0, visibleIndex - 1), candles.length - 1);
    return candles[idx] || null;
  }, [candles, visibleIndex]);

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ChartSettings>(() => loadSettings());

  const suggestions = useMemo(() => {
    const list = market === "CRYPTO" ? CRYPTO_SUGGESTIONS : FOREX_SUGGESTIONS;
    const q = symbolInput.trim().toUpperCase();
    if (!q) return list;
    return list.filter((s) => s.toUpperCase().includes(q)).slice(0, 8);
  }, [market, symbolInput]);

  // -------------------------------
  // Fetch Candles
  // -------------------------------
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
      setTrades([]);
      setFirstPoint(null);

      toast.success("Candles loaded ✅", { id: "load" });
    } catch (err: any) {
      toast.error(err.message || "Failed to load candles ❌", { id: "load" });
    }
  };

  // auto load (debounced)
  useEffect(() => {
    const t = setTimeout(() => loadData(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolInput, interval, market]);

  // -------------------------------
  // Chart init
  // -------------------------------
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 620,
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
        timeVisible: true, // ✅ bottom time like TV
        secondsVisible: false,
      },
      crosshair: settings.crosshair
        ? {
            mode: CrosshairMode.Normal,
            vertLine: { width: 1, color: "rgba(148,163,184,0.35)", style: LineStyle.Solid },
            horzLine: { width: 1, color: "rgba(148,163,184,0.35)", style: LineStyle.Solid },
          }
        : {
            mode: CrosshairMode.Hidden,
          },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: settings.upColor,
      downColor: settings.downColor,
      wickUpColor: settings.wickUpColor,
      wickDownColor: settings.wickDownColor,
      borderUpColor: settings.borderUpColor,
      borderDownColor: settings.borderDownColor,
    });

    const drawingSeries = chart.addLineSeries({
      color: "#38bdf8",
      lineWidth: 2,
    });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    drawingSeriesRef.current = drawingSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartRef.current?.clientWidth || 900 });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------
  // Apply settings LIVE (like TradingView)
  // -------------------------------
  useEffect(() => {
    const chart = chartInstanceRef.current;
    const candle = candleSeriesRef.current;
    if (!chart || !candle) return;

    chart.applyOptions({
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
        : {
            mode: CrosshairMode.Hidden,
          },
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

  // update chart slice
  useEffect(() => {
    if (!candles.length) return;
    const slice = candles.slice(0, Math.min(visibleIndex, candles.length));
    candleSeriesRef.current?.setData(slice);
    chartInstanceRef.current?.timeScale().scrollToRealTime();
  }, [candles, visibleIndex]);

  // markers update
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    candleSeriesRef.current.setMarkers(
      trades.map((t) => ({
        time: t.time,
        position: t.side === "BUY" ? "belowBar" : "aboveBar",
        color: t.side === "BUY" ? "#22c55e" : "#ef4444",
        shape: t.side === "BUY" ? "arrowUp" : "arrowDown",
        text: `${t.side} @ ${t.price.toFixed(2)}`,
      }))
    );
  }, [trades]);

  // replay engine
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

  // keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.key === "ArrowRight") setVisibleIndex((prev) => Math.min(prev + 1, candles.length));
      if (e.key === "ArrowLeft") setVisibleIndex((prev) => Math.max(prev - 1, 1));
      if (e.key.toLowerCase() === "r") {
        setPlaying(false);
        setVisibleIndex(Math.min(80, candles.length));
      }
      if (e.key.toLowerCase() === "b") placeTrade("BUY");
      if (e.key.toLowerCase() === "s") placeTrade("SELL");
      if (e.key.toLowerCase() === "c") setSettingsOpen(true); // chart settings shortcut
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, visibleIndex]);

  // mouse tools
  useEffect(() => {
    const chart = chartInstanceRef.current;
    const series = candleSeriesRef.current;
    const drawing = drawingSeriesRef.current;
    if (!chart || !series || !drawing) return;

    const onClick = (param: any) => {
      if (!param?.time) return;

      const price = param?.seriesPrices?.get(series);
      if (!price) return;

      const time = param.time as UTCTimestamp;

      if (activeTool === "hline") {
        const leftTime = candles[Math.max(0, visibleIndex - 30)]?.time as UTCTimestamp;
        const rightTime = candles[Math.max(0, visibleIndex - 1)]?.time as UTCTimestamp;
        drawing.setData([
          { time: leftTime, value: price },
          { time: rightTime, value: price },
        ]);
        toast.success("Horizontal line added ✅");
      }

      if (activeTool === "trendline") {
        if (!firstPoint) {
          setFirstPoint({ time, price });
          toast("Select 2nd point...");
          return;
        }
        drawing.setData([
          { time: firstPoint.time, value: firstPoint.price },
          { time, value: price },
        ]);
        setFirstPoint(null);
        toast.success("Trendline added ✅");
      }

      if (activeTool === "delete") {
        drawing.setData([]);
        setFirstPoint(null);
        toast.success("Deleted drawings ✅");
      }
    };

    chart.subscribeClick(onClick);
    return () => chart.unsubscribeClick(onClick);
  }, [activeTool, firstPoint, candles, visibleIndex]);

  // place trade marker
  const placeTrade = (side: TradeSide) => {
    if (!candles.length) return;
    const idx = Math.min(visibleIndex - 1, candles.length - 1);
    const candle = candles[idx];
    if (!candle) return;

    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const price = candle.close;

    setTrades((prev) => [
      ...prev,
      {
        id,
        time: candle.time as UTCTimestamp,
        side,
        price,
      },
    ]);

    toast.success(`${side} marker placed ✅`);
  };

  const showDropdown = isTyping && suggestions.length > 1;

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-[#070b14] border-b border-white/10 px-3 py-2 flex flex-wrap items-center gap-2">
        <div className="font-bold text-base tracking-wide">TradeFX</div>

        {/* Market */}
        <select
          className="bg-white/5 border border-white/10 px-3 py-2 rounded text-sm"
          value={market}
          onChange={(e) => {
            const newMarket = e.target.value as MarketType;
            setMarket(newMarket);
            setCandles([]);
            setVisibleIndex(50);
            setPlaying(false);

            if (newMarket === "CRYPTO") setSymbolInput("BTCUSDT");
            else setSymbolInput("XAU/USD");
          }}
        >
          <option value="FOREX">FOREX</option>
          <option value="CRYPTO">CRYPTO</option>
        </select>

        {/* Symbol */}
        <div className="relative">
          <input
            className="bg-white/5 border border-white/10 px-3 py-2 rounded text-sm w-[200px] outline-none focus:ring-2 focus:ring-sky-400/30"
            value={symbolInput}
            onChange={(e) => {
              setSymbolInput(e.target.value);
              setIsTyping(true);
            }}
            onBlur={() => setTimeout(() => setIsTyping(false), 150)}
            placeholder={market === "CRYPTO" ? "BTCUSDT" : "XAU/USD"}
          />

          {showDropdown && (
            <div className="absolute z-50 bg-[#0f172a] text-slate-200 border border-white/10 rounded shadow w-full mt-1 max-h-44 overflow-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => {
                    setSymbolInput(s);
                    setIsTyping(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm"
                  type="button"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Interval */}
        <select
          className="bg-white/5 border border-white/10 px-3 py-2 rounded text-sm"
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

        {/* Chart Settings Button */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded text-sm"
          title="Chart Settings (C)"
        >
          ⚙ Settings (C)
        </button>

        {/* Replay controls */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <select
            className="bg-white/5 border border-white/10 px-3 py-2 rounded text-sm"
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
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            {playing ? "Pause" : "Play"} (Space)
          </button>

          <button
            onClick={() => setVisibleIndex((prev) => Math.min(prev + 1, candles.length))}
            disabled={!candles.length}
            className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            Next (→)
          </button>

          <button
            onClick={() => setVisibleIndex((prev) => Math.max(prev - 1, 1))}
            disabled={!candles.length}
            className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            Prev (←)
          </button>

          <button
            onClick={() => {
              setPlaying(false);
              setVisibleIndex(Math.min(80, candles.length));
            }}
            disabled={!candles.length}
            className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            Reset (R)
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Toolbar */}
        <div className="w-14 bg-[#070b14] border-r border-white/10 text-slate-200 flex flex-col items-center py-3 gap-3">
          <button
            onClick={() => setActiveTool("cursor")}
            className={`w-9 h-9 rounded flex items-center justify-center ${
              activeTool === "cursor" ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
            }`}
            title="Cursor"
          >
            🖱️
          </button>

          <button
            onClick={() => setActiveTool("trendline")}
            className={`w-9 h-9 rounded flex items-center justify-center ${
              activeTool === "trendline" ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
            }`}
            title="Trendline"
          >
            📈
          </button>

          <button
            onClick={() => setActiveTool("hline")}
            className={`w-9 h-9 rounded flex items-center justify-center ${
              activeTool === "hline" ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
            }`}
            title="Horizontal Line"
          >
            ➖
          </button>

          <button
            onClick={() => setActiveTool("delete")}
            className={`w-9 h-9 rounded flex items-center justify-center ${
              activeTool === "delete" ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
            }`}
            title="Delete drawings"
          >
            🗑️
          </button>
        </div>

        {/* Chart */}
        <div className="flex-1 p-3">
          <div className="bg-[#070b14] rounded-xl shadow border border-white/10 overflow-hidden">
            <div ref={chartRef} />
          </div>

          {!candles.length && (
            <div className="text-center text-slate-400 mt-6">
              Loading chart automatically... ✅
            </div>
          )}
        </div>
      </div>

      {/* ✅ TradingView-like Bottom Bar (Time + OHLC) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b14] border-t border-white/10 px-3 py-2 flex items-center gap-3 text-xs">
        <div className="text-slate-400">
          {market} • {symbolInput.toUpperCase()} • {interval}
        </div>

        <div className="text-slate-300">
          Time: <span className="text-slate-100">{formatCandleTime(currentCandle?.time as any)}</span>
        </div>

        <div className="text-slate-300">
          O: <span className="text-slate-100">{currentCandle?.open?.toFixed?.(2) ?? "--"}</span>
        </div>
        <div className="text-slate-300">
          H: <span className="text-slate-100">{currentCandle?.high?.toFixed?.(2) ?? "--"}</span>
        </div>
        <div className="text-slate-300">
          L: <span className="text-slate-100">{currentCandle?.low?.toFixed?.(2) ?? "--"}</span>
        </div>
        <div className="text-slate-300">
          C: <span className="text-slate-100">{currentCandle?.close?.toFixed?.(2) ?? "--"}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="text-slate-400">
            {Math.min(visibleIndex, candles.length)} / {candles.length || 0}
          </div>

          {!!candles.length && (
            <input
              type="range"
              min={1}
              max={candles.length}
              value={Math.min(visibleIndex, candles.length)}
              onChange={(e) => {
                setPlaying(false);
                setVisibleIndex(Number(e.target.value));
              }}
              className="w-[220px]"
            />
          )}
        </div>
      </div>

      {/* ✅ Chart Settings Modal (TradingView-like) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0b1220] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="font-semibold text-sm">Chart Settings</div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded text-xs"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Background</div>
                  <input
                    type="color"
                    value={settings.background}
                    onChange={(e) => setSettings((p) => ({ ...p, background: e.target.value }))}
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Text Color</div>
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => setSettings((p) => ({ ...p, textColor: e.target.value }))}
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Grid Color</div>
                  <input
                    type="text"
                    value={settings.gridColor}
                    onChange={(e) => setSettings((p) => ({ ...p, gridColor: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-xs"
                    placeholder="rgba(148,163,184,0.08)"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Border Color</div>
                  <input
                    type="text"
                    value={settings.borderColor}
                    onChange={(e) => setSettings((p) => ({ ...p, borderColor: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-xs"
                    placeholder="rgba(148,163,184,0.25)"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <div>
                  <div className="font-semibold text-sm">Crosshair</div>
                  <div className="text-xs text-slate-400">Show / hide crosshair</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.crosshair}
                  onChange={(e) => setSettings((p) => ({ ...p, crosshair: e.target.checked }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Bull Candle</div>
                  <input
                    type="color"
                    value={settings.upColor}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        upColor: e.target.value,
                        wickUpColor: e.target.value,
                        borderUpColor: e.target.value,
                      }))
                    }
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Bear Candle</div>
                  <input
                    type="color"
                    value={settings.downColor}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        downColor: e.target.value,
                        wickDownColor: e.target.value,
                        borderDownColor: e.target.value,
                      }))
                    }
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setSettings(DEFAULT_SETTINGS)}
                  className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded text-xs"
                >
                  Reset Default
                </button>

                <button
                  onClick={() => {
                    saveSettings(settings);
                    toast.success("Settings saved ✅");
                  }}
                  className="bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500/30 px-3 py-2 rounded text-xs"
                >
                  Save
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Shortcut: Press <span className="text-slate-200 font-semibold">C</span> to open settings
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
