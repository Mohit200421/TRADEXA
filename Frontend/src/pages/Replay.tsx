import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { createChart } from "lightweight-charts";

const CRYPTO_SUGGESTIONS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOGEUSDT",
];

const FOREX_SUGGESTIONS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "USD/CHF",
  "AUD/USD",
  "USD/CAD",
  "XAU/USD",
];

export default function Replay() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const chartInstanceRef = useRef<any>(null);

  const [market, setMarket] = useState<"CRYPTO" | "FOREX">("CRYPTO");

  const [symbolInput, setSymbolInput] = useState("BTCUSDT");
  const [interval, setIntervalValue] = useState("1h");

  const [candles, setCandles] = useState<any[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(50);

  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

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

  const fetchForexCandles = async (symbol: string) => {
    const apiKey = import.meta.env.VITE_TWELVE_API_KEY;

    if (!apiKey) {
      throw new Error("TwelveData API key missing (VITE_TWELVE_API_KEY)");
    }

    // EUR/USD -> EURUSD
    const forexSymbol = symbol.replace("/", "").toUpperCase();

    const mapInterval: any = {
      "1m": "1min",
      "5m": "5min",
      "15m": "15min",
      "1h": "1h",
      "4h": "4h",
      "1d": "1day",
    };

    const tdInterval = mapInterval[interval] || "1h";

    const url = `https://api.twelvedata.com/time_series?symbol=${forexSymbol}&interval=${tdInterval}&outputsize=250&apikey=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data?.values) {
      throw new Error(data?.message || "Invalid forex symbol");
    }

    return data.values.reverse().map((c: any) => ({
      time: Math.floor(new Date(c.datetime).getTime() / 1000),
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
    }));
  };

  const loadData = async () => {
    try {
      const finalSymbol =
        market === "CRYPTO"
          ? symbolInput.trim().toUpperCase().replace("/", "")
          : symbolInput.trim().toUpperCase();

      if (!finalSymbol) {
        toast.error("Enter a symbol ❌");
        return;
      }

      setPlaying(false);
      toast.loading("Loading candles...", { id: "load" });

      let formatted: any[] = [];
      if (market === "CRYPTO") formatted = await fetchCryptoCandles(finalSymbol);
      else formatted = await fetchForexCandles(finalSymbol);

      setCandles(formatted);
      setVisibleIndex(50);

      toast.success("Candles loaded ✅", { id: "load" });
    } catch (err: any) {
      toast.error(err.message || "Failed to load candles ❌", { id: "load" });
    }
  };

  // -------------------------------
  // Chart init
  // -------------------------------
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 520,
      layout: { background: { color: "#ffffff" }, textColor: "#000" },
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

  // Update chart data
  useEffect(() => {
    if (!candles.length) return;
    const slice = candles.slice(0, Math.min(visibleIndex, candles.length));
    candleSeriesRef.current?.setData(slice);
  }, [candles, visibleIndex]);

  // Replay engine
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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📈 Bar Replay + Backtesting</h1>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <div className="grid md:grid-cols-5 gap-3">
          {/* Market */}
          <select
            className="border p-2 rounded"
            value={market}
            onChange={(e) => {
              const newMarket = e.target.value as "CRYPTO" | "FOREX";
              setMarket(newMarket);
              setCandles([]);
              setVisibleIndex(50);
              setPlaying(false);

              if (newMarket === "CRYPTO") setSymbolInput("BTCUSDT");
              else setSymbolInput("EUR/USD");
            }}
          >
            <option value="CRYPTO">Crypto</option>
            <option value="FOREX">Forex</option>
          </select>

          {/* Symbol search */}
          <div className="relative md:col-span-2">
            <input
              className="border p-2 rounded w-full"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              placeholder={
                market === "CRYPTO"
                  ? "Search symbol e.g. BTCUSDT"
                  : "Search symbol e.g. EUR/USD"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") loadData();
              }}
            />

            {/* Suggestions */}
            {symbolInput.length > 0 && suggestions.length > 0 && (
              <div className="absolute z-50 bg-white border rounded shadow w-full mt-1 max-h-44 overflow-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSymbolInput(s)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
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

          {/* Load */}
          <button
            onClick={loadData}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Load Data
          </button>
        </div>

        {/* Replay buttons */}
        <div className="flex gap-3 flex-wrap items-center">
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
            onClick={() => setPlaying((p) => !p)}
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
            }}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={!candles.length}
          >
            Reset
          </button>

          <p className="text-sm text-gray-500">
            Showing: <b>{Math.min(visibleIndex, candles.length)}</b> /{" "}
            <b>{candles.length}</b> candles
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow border p-2">
        <div ref={chartRef} />
      </div>
    </div>
  );
}
