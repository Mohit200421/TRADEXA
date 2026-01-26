import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function ReplayBacktest() {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#000",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
    });

    // ✅ Candlestick series
    const candleSeries = chart.addCandlestickSeries();

    // Dummy candle data
    candleSeries.setData([
      { time: "2024-01-01", open: 100, high: 110, low: 95, close: 105 },
      { time: "2024-01-02", open: 105, high: 115, low: 100, close: 112 },
      { time: "2024-01-03", open: 112, high: 118, low: 108, close: 110 },
      { time: "2024-01-04", open: 110, high: 120, low: 109, close: 118 },
    ]);

    chart.timeScale().fitContent();

    // cleanup
    return () => {
      chart.remove();
    };
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Bar Replay + Backtesting</h1>

      <div
        ref={chartContainerRef}
        className="bg-white rounded-xl shadow border"
      />
    </div>
  );
}
