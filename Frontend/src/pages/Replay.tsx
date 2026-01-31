import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CrosshairMode,
  LineStyle,
} from "lightweight-charts";

/* =====================
   TYPES
===================== */
type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Speed = 100 | 300 | 700;

/* =====================
   CONFIG
===================== */
const SYMBOLS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "XAU/USD"];
const TIMEFRAME = "5min";

/* =====================
   COMPONENT
===================== */
export default function Replay() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartApi = useRef<any>(null);
  const candleSeries = useRef<any>(null);

  const [symbol, setSymbol] = useState("GBP/USD");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(300);

  /* =====================
     THEME DETECTION
  ===================== */
  const isDark = document.documentElement.classList.contains("dark");

  const theme = {
    background: isDark ? "#0b1220" : "#ffffff",
    text: isDark ? "#e5e7eb" : "#111827",
    grid: isDark ? "rgba(148,163,184,0.08)" : "#e5e7eb",
    border: isDark ? "rgba(148,163,184,0.25)" : "#d1d5db",
    bull: "#22c55e",
    bear: "#ef4444",
  };

  /* =====================
     INIT CHART
  ===================== */
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 520,
      layout: {
        background: { color: theme.background },
        textColor: theme.text,
      },
      grid: {
        vertLines: { color: theme.grid },
        horzLines: { color: theme.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#9ca3af", style: LineStyle.Dotted },
        horzLine: { color: "#9ca3af", style: LineStyle.Dotted },
      },
      rightPriceScale: {
        borderColor: theme.border,
        textColor: theme.text,
      },
      timeScale: {
        borderColor: theme.border,
        textColor: theme.text,
        timeVisible: true,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: theme.bull,
      downColor: theme.bear,
      wickUpColor: theme.bull,
      wickDownColor: theme.bear,
      borderUpColor: theme.bull,
      borderDownColor: theme.bear,
    });

    chartApi.current = chart;
    candleSeries.current = series;

    window.addEventListener("resize", () => {
      chart.applyOptions({
        width: chartRef.current?.clientWidth || 800,
      });
    });

    return () => chart.remove();
  }, []);

  /* =====================
     APPLY THEME ON CHANGE
  ===================== */
  useEffect(() => {
    if (!chartApi.current) return;

    chartApi.current.applyOptions({
      layout: {
        background: { color: theme.background },
        textColor: theme.text,
      },
      grid: {
        vertLines: { color: theme.grid },
        horzLines: { color: theme.grid },
      },
      rightPriceScale: {
        borderColor: theme.border,
        textColor: theme.text,
      },
      timeScale: {
        borderColor: theme.border,
        textColor: theme.text,
      },
    });
  }, [isDark]);

  /* =====================
     FETCH CANDLES
  ===================== */
  useEffect(() => {
    loadCandles();
  }, [symbol]);

  async function loadCandles() {
    setPlaying(false);
    setIndex(0);

    const apiKey = import.meta.env.VITE_TWELVE_API_KEY;
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
      symbol
    )}&interval=${TIMEFRAME}&outputsize=5000&apikey=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.values) return;

    const formatted: Candle[] = data.values
      .reverse()
      .map((c: any) => ({
        time: Math.floor(new Date(c.datetime).getTime() / 1000),
        open: +c.open,
        high: +c.high,
        low: +c.low,
        close: +c.close,
      }));

    setCandles(formatted);
    candleSeries.current.setData([]);
  }

  /* =====================
     REPLAY ENGINE
  ===================== */
  useEffect(() => {
    if (!playing || index >= candles.length) return;

    const t = setTimeout(() => {
      candleSeries.current.setData(candles.slice(0, index + 1));
      setIndex((i) => i + 1);
    }, speed);

    return () => clearTimeout(t);
  }, [playing, index, speed, candles]);

  /* =====================
     UI
  ===================== */
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="px-3 py-2 rounded-lg border"
        >
          {SYMBOLS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={() => setPlaying((p) => !p)}
          className={`px-4 py-2 rounded-lg text-white ${
            playing ? "bg-red-500" : "bg-emerald-600"
          }`}
        >
          {playing ? "Pause" : "Play"}
        </button>

        <button
          onClick={() => {
            const next = Math.min(index + 1, candles.length);
            candleSeries.current.setData(candles.slice(0, next));
            setIndex(next);
          }}
          className="px-4 py-2 rounded-lg border"
        >
          Next
        </button>

        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value) as Speed)}
          className="px-3 py-2 rounded-lg border"
        >
          <option value={700}>Slow</option>
          <option value={300}>Normal</option>
          <option value={100}>Fast</option>
        </select>

        <span className="ml-auto text-sm opacity-70">
          {index}/{candles.length}
        </span>
      </div>

      <div
        ref={chartRef}
        className="h-[520px] rounded-xl border"
      />
    </div>
  );
}
