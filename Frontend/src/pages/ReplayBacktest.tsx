import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

export default function ReplayBacktest() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const candleSeriesRef = useRef<any>(null);

  const [candles, setCandles] = useState<any[]>([]);
  const [index, setIndex] = useState(50);
  const [playing, setPlaying] = useState(false);

  // ✅ Dummy candles (later we will load real data)
  useEffect(() => {
    const dummy = [];
    let price = 100;
    for (let i = 0; i < 200; i++) {
      const open = price;
      const close = open + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random();
      const low = Math.min(open, close) - Math.random();
      price = close;

      dummy.push({
        time: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
        open,
        high,
        low,
        close,
      });
    }
    setCandles(dummy);
  }, []);

  // ✅ Create chart
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
    });

    const candleSeries = chart.addCandlestickSeries();
    candleSeriesRef.current = candleSeries;

    return () => chart.remove();
  }, []);

  // ✅ Update candles on replay
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    candleSeriesRef.current.setData(candles.slice(0, index));
  }, [candles, index]);

  // ✅ Play mode
  useEffect(() => {
    if (!playing) return;

    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= candles.length) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [playing, candles.length]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bar Replay & Backtesting</h1>

      <div ref={chartRef} className="bg-white rounded-xl shadow p-2"></div>

      {/* Controls */}
      <div className="mt-4 bg-white p-4 rounded-xl shadow grid gap-3">
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setPlaying(!playing)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {playing ? "Pause" : "Play"}
          </button>

          <button
            onClick={() => {
              setPlaying(false);
              setIndex(50);
            }}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Reset
          </button>

          <p className="text-sm text-gray-500">
            Candle: {index}/{candles.length}
          </p>
        </div>

        {/* Slider */}
        <input
          type="range"
          min={10}
          max={candles.length}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
