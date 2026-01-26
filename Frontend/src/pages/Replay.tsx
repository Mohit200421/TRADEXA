import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { createChart } from "lightweight-charts";

const FOREX_SYMBOLS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CAD",
  "USD/CHF",
  "NZD/USD",
  "XAU/USD",
];

const CRYPTO_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "ADAUSDT",
];

export default function Replay() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const chartInstanceRef = useRef<any>(null);

  const [market, setMarket] = useState<"CRYPTO" | "FOREX">("CRYPTO");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [search, setSearch] = useState("");

  const [interval, setIntervalValue] = useState("1h");
  const [candles, setCandles] = useState<any[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(50);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  // ✅ Crypto candles from Binance
  const fetchCryptoCandles = async () => {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=500`;
    const res = await fetch(url);
    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Invalid crypto symbol");

    return data.map((c: any) => ({
      time: c[0] / 1000,
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
    }));
  };

  // ✅ Forex candles from TwelveData
  const fetchForexCandles = async () => {
    const apiKey = import.meta.env.VITE_TWELVE_API_KEY;
    if (!apiKey) throw new Error("TwelveData API key missing");

    const forexSymbol = symbol.replace("/", "");

    const mapInterval: any = {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "1h": "1h",
      "4h": "4h",
      "1d": "1day",
    };

    const tdInterval = mapInterval[interval] || "1h";

    const url = `https://api.twelvedata.com/time_series?symbol=${forexSymbol}&interval=${tdInterval}&outputsize=500&apikey=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data?.values) throw new Error(data?.message || "Invalid forex symbol");

    // TwelveData returns newest first → reverse it
    return data.values
      .reverse()
      .map((c: any) => ({
        time: Math.floor(new Date(c.datetime).getTime() / 1000),
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
      }));
  };

  const fetchCandles = async () => {
    try {
      setPlaying(false);
      toast.loading("Loading candles...", { id: "load" });

      let formatted: any[] = [];

      if (market === "CRYPTO") {
        formatted = await fetchCryptoCandles();
      } else {
        formatted = await fetchForexCandles();
      }

      setCandles(formatted);
      setVisibleIndex(50);

      toast.success("Candles loaded ✅", { id: "load" });

      setTimeout(() => {
        chartInstanceRef.current?.timeScale().fitContent();
      }, 200);
    } catch (err: any) {
      toast.error(err.message || "Failed to load candles ❌", { id: "load" });
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

    const safeIndex = Math.min(visibleIndex, candles.length);
    const slice = candles.slice(0, safeIndex);
    candleSeriesRef.current?.setData(slice);
  }, [candles, visibleIndex]);

  // ✅ Replay play mode
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

  const list = market === "CRYPTO" ? CRYPTO_SYMBOLS : FOREX_SYMBOLS;
  const filtered = list.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📈 Bar Replay + Backtest</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-4 grid gap-3">
        <div className="grid md:grid-cols-5 gap-3">
          <select
            className="border p-2 rounded"
            value={market}
            onChange={(e) => {
              const newMarket = e.target.value as "CRYPTO" | "FOREX";
              setMarket(newMarket);

              if (newMarket === "CRYPTO") setSymbol("BTCUSDT");
              else setSymbol("EUR/USD");

              setSearch("");
              setCandles([]);
              setVisibleIndex(50);
              setPlaying(false);
            }}
          >
            <option value="CRYPTO">Crypto</option>
            <option value="FOREX">Forex</option>
          </select>

          <input
            className="border p-2 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol..."
          />

          <select
            className="border p-2 rounded"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          >
            {filtered.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

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

          <button
            onClick={fetchCandles}
            className="bg-black text-white py-2 rounded"
          >
            Load Data
          </button>
        </div>

        <div className="flex gap-3 flex-wrap">
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
            onClick={() => setPlaying(!playing)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={!candles.length}
          >
            {playing ? "Pause" : "Play"}
          </button>

          <button
            onClick={() =>
              setVisibleIndex((prev) => Math.min(prev + 1, candles.length))
            }
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

      <div ref={chartRef} className="bg-white rounded-xl shadow border" />
    </div>
  );
}
