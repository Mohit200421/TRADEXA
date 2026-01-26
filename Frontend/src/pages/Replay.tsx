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

  // drawings: we keep one line-series per drawing (simple approach)
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

  // UI
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false);

  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const [indicatorSettingsOpen, setIndicatorSettingsOpen] = useState(false);

  const [settings, setSettings] = useState<ChartSettings>(() => loadSettings());
  const [indicators, setIndicators] = useState<IndicatorConfig>(() => DEFAULT_INDICATORS);

  // drawings
  const [activeTool, setActiveTool] = useState<DrawingTool>("cursor");
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [pendingPoint, setPendingPoint] = useState<{ time: UTCTimestamp; price: number } | null>(
    null
  );

  // select drawing
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);

  // right click menu
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

  /* -------------------- Main Chart init -------------------- */
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 560,
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

    const handleResize = () => chart.applyOptions({ width: chartRef.current?.clientWidth || 900 });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- RSI Chart init -------------------- */
  useEffect(() => {
    if (!rsiChartRef.current) return;

    const rsiChart = createChart(rsiChartRef.current, {
      width: rsiChartRef.current.clientWidth,
      height: 180,
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
  }, []);

  /* -------------------- Apply Chart Settings -------------------- */
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

  /* -------------------- Update Candle Slice -------------------- */
  useEffect(() => {
    if (!candles.length) return;

    const slice = candles.slice(0, Math.min(visibleIndex, candles.length));
    candleSeriesRef.current?.setData(slice);
    chartApiRef.current?.timeScale().scrollToRealTime();

    updateIndicators(slice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, visibleIndex, indicators]);

  /* -------------------- Indicators Engine -------------------- */
  const updateIndicators = (slice: CandlestickData[]) => {
    if (!slice.length) return;
    const closes = slice.map((c) => c.close);

    // EMA
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

    // RSI
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

  /* -------------------- Crosshair Sync (Main ↔ RSI) -------------------- */
  useEffect(() => {
    const mainChart = chartApiRef.current;
    const rsiChart = rsiChartApiRef.current;
    if (!mainChart || !rsiChart) return;

    const mainTimeScale = mainChart.timeScale();
    const rsiTimeScale = rsiChart.timeScale();

    const mainSub = mainTimeScale.subscribeVisibleTimeRangeChange((range) => {
      if (!range) return;
      rsiTimeScale.setVisibleRange(range);
    });

    const rsiSub = rsiTimeScale.subscribeVisibleTimeRangeChange((range) => {
      if (!range) return;
      mainTimeScale.setVisibleRange(range);
    });

    const syncCrosshair = (_param: any) => {
      // lightweight-charts doesn't allow setting crosshair programmatically
      // range sync gives almost TV feel
    };

    mainChart.subscribeCrosshairMove(syncCrosshair);
    rsiChart.subscribeCrosshairMove(syncCrosshair);

    return () => {
      // @ts-ignore
      if (mainSub) mainSub();
      // @ts-ignore
      if (rsiSub) rsiSub();
      mainChart.unsubscribeCrosshairMove(syncCrosshair);
      rsiChart.unsubscribeCrosshairMove(syncCrosshair);
    };
  }, []);

  /* -------------------- Right Click Menu -------------------- */
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setCtxMenu({ open: true, x: e.clientX, y: e.clientY });
    };

    const close = () => setCtxMenu((p) => ({ ...p, open: false }));

    el.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close);

    return () => {
      el.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close);
    };
  }, []);

  /* -------------------- Drawing Helpers -------------------- */
  function distancePointToLine(
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number
  ) {
    const dx = bx - ax;
    const dy = by - ay;

    if (dx === 0 && dy === 0) {
      return Math.hypot(px - ax, py - ay);
    }

    const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
    const tt = Math.max(0, Math.min(1, t));

    const cx = ax + tt * dx;
    const cy = ay + tt * dy;

    return Math.hypot(px - cx, py - cy);
  }

  const findDrawingNearClick = (param: any) => {
    const chart = chartApiRef.current;
    const candle = candleSeriesRef.current;
    if (!chart || !candle) return null;

    if (!param?.point || !param?.time) return null;

    const clickedPrice = param?.seriesPrices?.get(candle);
    if (!clickedPrice) return null;

    const time = param.time as UTCTimestamp;
    const price = clickedPrice as number;

    const x = chart.timeScale().timeToCoordinate(time);
    const y = candle.priceToCoordinate(price);

    if (x == null || y == null) return null;

    let bestId: string | null = null;
    let bestDist = Infinity;

    const thresholdPx = 12;

    for (const d of drawings) {
      if (d.type === "hline") {
        const p = d.points[0];
        if (!p) continue;

        const yy = candle.priceToCoordinate(p.price);
        if (yy == null) continue;

        const dist = Math.abs(y - yy);
        if (dist < bestDist && dist <= thresholdPx) {
          bestDist = dist;
          bestId = d.id;
        }
        continue;
      }

      if (d.points.length >= 2) {
        const [a, b] = d.points;

        const ax = chart.timeScale().timeToCoordinate(a.time);
        const ay = candle.priceToCoordinate(a.price);

        const bx = chart.timeScale().timeToCoordinate(b.time);
        const by = candle.priceToCoordinate(b.price);

        if (ax == null || ay == null || bx == null || by == null) continue;

        const dist = distancePointToLine(x, y, ax, ay, bx, by);
        if (dist < bestDist && dist <= thresholdPx) {
          bestDist = dist;
          bestId = d.id;
        }
      }
    }

    return bestId;
  };

  /* -------------------- Drawings Engine -------------------- */
  const removeAllDrawingSeries = () => {
    const chart = chartApiRef.current;
    if (!chart) return;

    Object.values(drawingSeriesMapRef.current).forEach((s) => {
      try {
        chart.removeSeries(s);
      } catch {}
    });

    drawingSeriesMapRef.current = {};
  };

  const redrawAll = () => {
    const chart = chartApiRef.current;
    if (!chart) return;

    removeAllDrawingSeries();

    drawings.forEach((d) => {
      const isSelected = d.id === selectedDrawingId;

      const series = chart.addLineSeries({
        lineWidth: isSelected ? 3 : 2,
        color: isSelected ? "#fbbf24" : "#38bdf8",
      });

      drawingSeriesMapRef.current[d.id] = series;

      if (d.type === "hline") {
        const p = d.points[0];
        if (!p) return;

        const leftTime = candles[Math.max(0, visibleIndex - 80)]?.time as UTCTimestamp;
        const rightTime = candles[Math.max(0, visibleIndex - 1)]?.time as UTCTimestamp;

        series.setData([
          { time: leftTime, value: p.price },
          { time: rightTime, value: p.price },
        ]);
        return;
      }

      if (d.points.length >= 2) {
        const [a, b] = d.points;

        series.setData([
          { time: a.time, value: a.price },
          { time: b.time, value: b.price },
        ]);
      }
    });
  };

  useEffect(() => {
    redrawAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawings, candles, visibleIndex, selectedDrawingId]);

  /* -------------------- Chart Click Handler -------------------- */
  useEffect(() => {
    const chart = chartApiRef.current;
    const candle = candleSeriesRef.current;
    if (!chart || !candle) return;

    const onClick = (param: any) => {
      if (!param?.time) return;

      // Cursor mode -> select drawings
      if (activeTool === "cursor") {
        const hitId = findDrawingNearClick(param);
        if (hitId) {
          setSelectedDrawingId(hitId);
        } else {
          setSelectedDrawingId(null);
        }
        return;
      }

      // drawing mode
      const price = param?.seriesPrices?.get(candle);
      if (!price) return;

      const time = param.time as UTCTimestamp;

      if (activeTool === "delete") {
        setDrawings([]);
        setSelectedDrawingId(null);
        setPendingPoint(null);
        toast.success("All drawings deleted ✅");
        return;
      }

      // single click tools
      if (activeTool === "hline") {
        const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
        setDrawings((prev) => [...prev, { id, type: "hline", points: [{ time, price }] }]);
        toast.success("Horizontal line added ✅");
        return;
      }

      // two-click tools
      const toolMap: Record<string, DrawingType> = {
        trendline: "trendline",
        ray: "ray",
        rectangle: "rectangle",
      };

      const type = toolMap[activeTool];
      if (!type) return;

      if (!pendingPoint) {
        setPendingPoint({ time, price });
        toast("Select 2nd point...");
        return;
      }

      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      setDrawings((prev) => [...prev, { id, type, points: [pendingPoint, { time, price }] }]);
      setPendingPoint(null);
      toast.success(`${type} added ✅`);
    };

    chart.subscribeClick(onClick);
    return () => chart.unsubscribeClick(onClick);
  }, [activeTool, pendingPoint, drawings]);

  /* -------------------- Delete Key Support -------------------- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selectedDrawingId && (e.key === "Delete" || e.key === "Backspace")) {
        setDrawings((prev) => prev.filter((d) => d.id !== selectedDrawingId));
        setSelectedDrawingId(null);
        toast.success("Drawing deleted ✅");
      }

      if (e.key === "Escape") {
        setSelectedDrawingId(null);
        setPendingPoint(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedDrawingId]);

  /* -------------------- Chart Controls (TradingView style) -------------------- */
  const resetView = () => {
    chartApiRef.current?.timeScale().fitContent();
    rsiChartApiRef.current?.timeScale().fitContent();
    toast.success("Chart view reset ✅");
  };

  const zoomIn = () => {
    const chart = chartApiRef.current;
    if (!chart) return;
    chart.timeScale().zoomIn();
  };

  const zoomOut = () => {
    const chart = chartApiRef.current;
    if (!chart) return;
    chart.timeScale().zoomOut();
  };

  const moveLeft = () => {
    const chart = chartApiRef.current;
    if (!chart) return;
    chart.timeScale().scrollToPosition(-30, false);
  };

  const moveRight = () => {
    const chart = chartApiRef.current;
    if (!chart) return;
    chart.timeScale().scrollToPosition(30, false);
  };

  /* -------------------- Render -------------------- */
  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200 pb-12">
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
            setVisibleIndex(80);
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

        {/* Always Visible Chart Settings */}
        <button
          onClick={() => setChartSettingsOpen(true)}
          className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded text-sm"
          title="Chart Settings"
        >
          ⚙ Chart Settings
        </button>

        {/* Single Indicators Button + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIndicatorsOpen((p) => !p)}
            className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded text-sm"
            title="Indicators"
          >
            📊 Indicators ▾
          </button>

          {indicatorsOpen && (
            <div className="absolute left-0 mt-2 w-[240px] bg-[#0f172a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-[9999]">
              <button
                onClick={() => {
                  setIndicators((p) => ({ ...p, ema: { ...p.ema, enabled: !p.ema.enabled } }));
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm"
              >
                {indicators.ema.enabled ? "Remove EMA" : "Add EMA"}
              </button>

              <button
                onClick={() => {
                  setIndicators((p) => ({ ...p, rsi: { ...p.rsi, enabled: !p.rsi.enabled } }));
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm"
              >
                {indicators.rsi.enabled ? "Remove RSI" : "Add RSI"}
              </button>

              <div className="h-[1px] bg-white/10" />

              <button
                onClick={() => {
                  setIndicatorSettingsOpen(true);
                  setIndicatorsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm"
              >
                Indicator Settings…
              </button>

              <button
                onClick={() => {
                  clearIndicators();
                  setIndicatorsOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm text-rose-300"
              >
                Clear Indicators
              </button>
            </div>
          )}
        </div>

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
            {playing ? "Pause" : "Play"}
          </button>

          <button
            onClick={() => setVisibleIndex((prev) => Math.min(prev + 1, candles.length))}
            disabled={!candles.length}
            className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            Next
          </button>

          <button
            onClick={() => {
              setPlaying(false);
              setVisibleIndex(Math.min(80, candles.length));
            }}
            disabled={!candles.length}
            className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Toolbar (Drawing Tools) */}
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
            title="Trend Line"
          >
            📈
          </button>

          <button
            onClick={() => setActiveTool("ray")}
            className={`w-9 h-9 rounded flex items-center justify-center ${
              activeTool === "ray" ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
            }`}
            title="Ray Line"
          >
            ➡️
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
            onClick={() => setActiveTool("rectangle")}
            className={`w-9 h-9 rounded flex items-center justify-center ${
              activeTool === "rectangle" ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
            }`}
            title="Rectangle (Box)"
          >
            ▭
          </button>

          <button
            onClick={() => setActiveTool("delete")}
            className={`w-9 h-9 rounded flex items-center justify-center ${
              activeTool === "delete" ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
            }`}
            title="Delete all drawings"
          >
            🗑️
          </button>
        </div>

        {/* Chart + RSI Panel */}
        <div className="flex-1 p-3">
          {/* Chart Wrapper with TradingView Controls */}
          <div className="relative bg-[#070b14] rounded-xl shadow border border-white/10 overflow-hidden">
            <div ref={chartRef} />

            {/* TradingView Floating Controls */}
            <div className="absolute top-3 left-3 z-50 flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="w-9 h-9 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                title="Zoom Out"
              >
                −
              </button>

              <button
                onClick={zoomIn}
                className="w-9 h-9 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                title="Zoom In"
              >
                +
              </button>

              <button
                onClick={moveLeft}
                className="w-9 h-9 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                title="Move Left"
              >
                ‹
              </button>

              <button
                onClick={moveRight}
                className="w-9 h-9 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                title="Move Right"
              >
                ›
              </button>

              <button
                onClick={resetView}
                className="w-9 h-9 rounded-lg bg-black/70 hover:bg-black/90 border border-white/10 text-white text-lg flex items-center justify-center"
                title="Reset"
              >
                ⟳
              </button>
            </div>
          </div>

          {/* RSI Panel */}
          {indicators.rsi.enabled && (
            <div className="mt-3 bg-[#070b14] rounded-xl shadow border border-white/10 overflow-hidden">
              <div className="px-3 py-2 text-xs text-slate-400 border-b border-white/10">
                RSI ({indicators.rsi.length})
              </div>
              <div ref={rsiChartRef} />
            </div>
          )}

          {!candles.length && (
            <div className="text-center text-slate-400 mt-6">
              Loading chart automatically... ✅
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b14] border-t border-white/10 px-3 py-2 flex items-center gap-3 text-xs">
        <div className="text-slate-400">
          {market} • {symbolInput.toUpperCase()} • {interval}
        </div>

        <div className="text-slate-300">
          Time:{" "}
          <span className="text-slate-100">{formatCandleTime(currentCandle?.time as any)}</span>
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

        <div className="ml-auto text-slate-400">
          {Math.min(visibleIndex, candles.length)} / {candles.length || 0}
        </div>
      </div>

      {/* Right Click Menu */}
      {ctxMenu.open && (
        <div
          className="fixed z-[9999] bg-[#0f172a] border border-white/10 rounded-xl shadow-xl w-[220px] overflow-hidden"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
        >
          <button
            onClick={() => {
              setChartSettingsOpen(true);
              setCtxMenu((p) => ({ ...p, open: false }));
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
          >
            Chart Settings…
          </button>

          <button
            onClick={() => {
              setIndicatorSettingsOpen(true);
              setCtxMenu((p) => ({ ...p, open: false }));
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
          >
            Indicator Settings…
          </button>

          <div className="h-[1px] bg-white/10" />

          {selectedDrawingId && (
            <button
              onClick={() => {
                setDrawings((prev) => prev.filter((d) => d.id !== selectedDrawingId));
                setSelectedDrawingId(null);
                setCtxMenu((p) => ({ ...p, open: false }));
                toast.success("Selected drawing deleted ✅");
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 text-rose-300"
            >
              Delete Selected Drawing
            </button>
          )}

          <button
            onClick={() => {
              resetView();
              setCtxMenu((p) => ({ ...p, open: false }));
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5"
          >
            Reset Chart View
          </button>

          <button
            onClick={() => {
              setDrawings([]);
              setSelectedDrawingId(null);
              setCtxMenu((p) => ({ ...p, open: false }));
              toast.success("Drawings cleared ✅");
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 text-rose-300"
          >
            Clear Drawings
          </button>
        </div>
      )}

      {/* Chart Settings Modal */}
      {chartSettingsOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0b1220] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="font-semibold text-sm">Chart Settings</div>
              <button
                onClick={() => setChartSettingsOpen(false)}
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
                  <div className="text-xs text-slate-400">Grid Color (rgba)</div>
                  <input
                    type="text"
                    value={settings.gridColor}
                    onChange={(e) => setSettings((p) => ({ ...p, gridColor: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-xs"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Border Color (rgba)</div>
                  <input
                    type="text"
                    value={settings.borderColor}
                    onChange={(e) => setSettings((p) => ({ ...p, borderColor: e.target.value }))}
                    className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-xs"
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

              <div className="grid grid-cols-3 gap-3">
                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Bull Body</div>
                  <input
                    type="color"
                    value={settings.upColor}
                    onChange={(e) => setSettings((p) => ({ ...p, upColor: e.target.value }))}
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Bull Wick</div>
                  <input
                    type="color"
                    value={settings.wickUpColor}
                    onChange={(e) => setSettings((p) => ({ ...p, wickUpColor: e.target.value }))}
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Bull Border</div>
                  <input
                    type="color"
                    value={settings.borderUpColor}
                    onChange={(e) => setSettings((p) => ({ ...p, borderUpColor: e.target.value }))}
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Bear Body</div>
                  <input
                    type="color"
                    value={settings.downColor}
                    onChange={(e) => setSettings((p) => ({ ...p, downColor: e.target.value }))}
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Bear Wick</div>
                  <input
                    type="color"
                    value={settings.wickDownColor}
                    onChange={(e) => setSettings((p) => ({ ...p, wickDownColor: e.target.value }))}
                    className="w-full h-10 rounded bg-transparent border border-white/10"
                  />
                </label>

                <label className="space-y-1">
                  <div className="text-xs text-slate-400">Bear Border</div>
                  <input
                    type="color"
                    value={settings.borderDownColor}
                    onChange={(e) => setSettings((p) => ({ ...p, borderDownColor: e.target.value }))}
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
                    setChartSettingsOpen(false);
                  }}
                  className="bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500/30 px-3 py-2 rounded text-xs"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicator Settings Modal */}
      {indicatorSettingsOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0b1220] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="font-semibold text-sm">Indicator Settings</div>
              <button
                onClick={() => setIndicatorSettingsOpen(false)}
                className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded text-xs"
              >
                Close
              </button>
            </div>

            <div className="p-4 space-y-4 text-sm">
              {/* EMA */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">EMA</div>
                    <div className="text-xs text-slate-400">Exponential Moving Average</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={indicators.ema.enabled}
                    onChange={(e) =>
                      setIndicators((p) => ({
                        ...p,
                        ema: { ...p.ema, enabled: e.target.checked },
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <label className="space-y-1">
                    <div className="text-xs text-slate-400">Period</div>
                    <input
                      type="number"
                      min={1}
                      value={indicators.ema.period}
                      onChange={(e) =>
                        setIndicators((p) => ({
                          ...p,
                          ema: { ...p.ema, period: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm"
                    />
                  </label>

                  <label className="space-y-1">
                    <div className="text-xs text-slate-400">Color</div>
                    <input
                      type="color"
                      value={indicators.ema.color}
                      onChange={(e) =>
                        setIndicators((p) => ({
                          ...p,
                          ema: { ...p.ema, color: e.target.value },
                        }))
                      }
                      className="w-full h-10 rounded bg-transparent border border-white/10"
                    />
                  </label>
                </div>
              </div>

              {/* RSI */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">RSI</div>
                    <div className="text-xs text-slate-400">Relative Strength Index</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={indicators.rsi.enabled}
                    onChange={(e) =>
                      setIndicators((p) => ({
                        ...p,
                        rsi: { ...p.rsi, enabled: e.target.checked },
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <label className="space-y-1">
                    <div className="text-xs text-slate-400">Length</div>
                    <input
                      type="number"
                      min={1}
                      value={indicators.rsi.length}
                      onChange={(e) =>
                        setIndicators((p) => ({
                          ...p,
                          rsi: { ...p.rsi, length: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm"
                    />
                  </label>

                  <label className="space-y-1">
                    <div className="text-xs text-slate-400">Color</div>
                    <input
                      type="color"
                      value={indicators.rsi.color}
                      onChange={(e) =>
                        setIndicators((p) => ({
                          ...p,
                          rsi: { ...p.rsi, color: e.target.value },
                        }))
                      }
                      className="w-full h-10 rounded bg-transparent border border-white/10"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setIndicators(DEFAULT_INDICATORS);
                    toast.success("Indicators reset ✅");
                  }}
                  className="bg-white/10 hover:bg-white/15 px-3 py-2 rounded text-xs"
                >
                  Reset Default
                </button>

                <button
                  onClick={() => {
                    toast.success("Indicator settings applied ✅");
                    setIndicatorSettingsOpen(false);
                  }}
                  className="bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500/30 px-3 py-2 rounded text-xs"
                >
                  Apply & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
