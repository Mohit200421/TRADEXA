import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { createChart } from "lightweight-charts";

export default function Replay() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const chartInstanceRef = useRef<any>(null);

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setIntervalValue] = useState("1h");
  const [candles, setCandles] = useState<any[]>([]);

  // 🔥 Start replay with 50 candles
  const [visibleIndex, setVisibleIndex] = useState(50);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  // ✅ Fetch candles from Binance
  const fetchCandles = async () => {
    try {
      setPlaying(false);
      toast.loading("Loading candles...", { id: "load" });

      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=500`;

      const res = await fetch(url);
      const data = await res.json();

      if (!Array.isArray(data)) {
        toast.error("Invalid Symbol ❌", { id: "load" });
        return;
      }

      const formatted = data.map((c: any) => ({
        time: c[0] / 1000,
        open: Number(c[1]),
        high: Number(c[2]),
        low: Number(c[3]),
        close: Number(c[4]),
      }));

      setCandles(formatted);

      // ✅ start from 50 candles (not 2000)
      setVisibleIndex(2000);

      toast.success("Candles loaded ✅", { id: "load" });

      // ✅ Fit content after load
      setTimeout(() => {
        chartInstanceRef.current?.timeScale().fitContent();
      }, 200);
    } catch (err) {
      toast.error("Failed to load candles ❌", { id: "load" });
    }
  };

  // ✅ Setup chart
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 450,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
    });

    const candleSeries = chart.addCandlestickSeries();

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartRef.current?.clientWidth || 800 });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // ✅ Update visible candles
  useEffect(() => {
    if (!candles.length) return;

    // 🔥 prevent overflow
    const safeIndex = Math.min(visibleIndex, candles.length);

    const slice = candles.slice(0, safeIndex);
    candleSeriesRef.current?.setData(slice);
  }, [candles, visibleIndex]);

  // ✅ Play replay
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
  }, [playing, speed, candles.length, candles]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📈 Bar Replay (Crypto Live)</h1>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 grid gap-3">
        <div className="grid md:grid-cols-4 gap-3">
          <input
            className="border p-2 rounded"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Symbol (BTCUSDT)"
          />

          <select
            className="border p-2 rounded"
            value={interval}
            onChange={(e) => setIntervalValue(e.target.value)}
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>

          <select
            className="border p-2 rounded"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={1200}>Slow</option>
            <option value={800}>Normal</option>
            <option value={300}>Fast</option>
            <option value={100}>Ultra Fast</option>
          </select>

          <button
            onClick={fetchCandles}
            className="bg-black text-white py-2 rounded"
          >
            Load Data
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setPlaying(!playing)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!candles.length}
          >
            {playing ? "Pause" : "Play"}
          </button>

          <button
            onClick={() => setVisibleIndex((prev) => Math.min(prev + 1, candles.length))}
            className="bg-gray-600 text-white px-4 py-2 rounded"
            disabled={!candles.length}
          >
            Next Candle
          </button>

          <button
            onClick={() => {
              setPlaying(false);
              setVisibleIndex(50);
              chartInstanceRef.current?.timeScale().fitContent();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={!candles.length}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="bg-white rounded-xl shadow border" />
    </div>
  );
}
