import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Calendar,
  Clock
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

interface Trade {
  pnl: number;
  status: "OPEN" | "CLOSED";
  type: "LONG" | "SHORT";
  entryDate: string;
}

type Period =
  | "Today"
  | "7 Days"
  | "30 Days"
  | "3 Months"
  | "1 Year"
  | "All Time";

type TradeFilter = "ALL" | "WINNERS" | "LOSERS";

export default function Performance() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [period, setPeriod] = useState<Period>("30 Days");
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("ALL");

  /* ================= FETCH TRADES ================= */
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await API.get("/trades");
        setTrades(res.data || []);
      } catch {
        toast.error("Failed to load performance data");
      }
    };
    fetchTrades();
  }, []);

  /* ================= DATE FILTER ================= */
  const periodFilteredTrades = useMemo(() => {
    const now = new Date();

    return trades.filter(t => {
      if (t.status !== "CLOSED") return false;

      const tradeDate = new Date(t.entryDate);
      const diffDays =
        (now.getTime() - tradeDate.getTime()) / (1000 * 60 * 60 * 24);

      switch (period) {
        case "Today":
          return tradeDate.toDateString() === now.toDateString();
        case "7 Days":
          return diffDays <= 7;
        case "30 Days":
          return diffDays <= 30;
        case "3 Months":
          return diffDays <= 90;
        case "1 Year":
          return diffDays <= 365;
        case "All Time":
        default:
          return true;
      }
    });
  }, [trades, period]);

  /* ================= TRADE FILTER ================= */
  const closedTrades = useMemo(() => {
    if (tradeFilter === "WINNERS")
      return periodFilteredTrades.filter(t => t.pnl > 0);

    if (tradeFilter === "LOSERS")
      return periodFilteredTrades.filter(t => t.pnl < 0);

    return periodFilteredTrades;
  }, [periodFilteredTrades, tradeFilter]);

  const openTrades = trades.filter(t => t.status === "OPEN");

  /* ================= CORE METRICS ================= */
  const totalPnL = closedTrades.reduce((s, t) => s + t.pnl, 0);

  const winners = closedTrades.filter(t => t.pnl > 0);
  const losers = closedTrades.filter(t => t.pnl < 0);

  const winRate =
    closedTrades.length === 0
      ? 0
      : (winners.length / closedTrades.length) * 100;

  const grossProfit = winners.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losers.reduce((s, t) => s + t.pnl, 0));

  const profitFactor =
    grossLoss === 0 ? 0 : grossProfit / grossLoss;

  const expectancy =
    closedTrades.length === 0
      ? 0
      : totalPnL / closedTrades.length;

  const avgWinner =
    winners.length === 0 ? 0 : grossProfit / winners.length;

  const avgLoser =
    losers.length === 0 ? 0 : grossLoss / losers.length;

  const bestTrade =
    closedTrades.length === 0
      ? 0
      : Math.max(...closedTrades.map(t => t.pnl));

  const worstTrade =
    closedTrades.length === 0
      ? 0
      : Math.min(...closedTrades.map(t => t.pnl));

  /* ================= STREAKS ================= */
  let winStreak = 0;
  let lossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  closedTrades.forEach(t => {
    if (t.pnl > 0) {
      winStreak++;
      lossStreak = 0;
    } else {
      lossStreak++;
      winStreak = 0;
    }
    maxWinStreak = Math.max(maxWinStreak, winStreak);
    maxLossStreak = Math.max(maxLossStreak, lossStreak);
  });

  /* ================= LONG vs SHORT ================= */
  const longTrades = closedTrades.filter(t => t.type === "LONG");
  const shortTrades = closedTrades.filter(t => t.type === "SHORT");

  const longPnL = longTrades.reduce((s, t) => s + t.pnl, 0);
  const shortPnL = shortTrades.reduce((s, t) => s + t.pnl, 0);

  const longWinRate =
    longTrades.length === 0
      ? 0
      : (longTrades.filter(t => t.pnl > 0).length /
          longTrades.length) *
        100;

  const shortWinRate =
    shortTrades.length === 0
      ? 0
      : (shortTrades.filter(t => t.pnl > 0).length /
          shortTrades.length) *
        100;

  /* ================= DAY PERFORMANCE ================= */
  const dayMap: Record<string, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
  };

  closedTrades.forEach(t => {
    const day = new Date(t.entryDate).toLocaleDateString("en-US", {
      weekday: "short"
    });
    dayMap[day] += t.pnl;
  });

  /* ================= CALENDAR ================= */
  const dailyPnL: Record<number, number> = {};
  closedTrades.forEach(t => {
    const d = new Date(t.entryDate).getDate();
    dailyPnL[d] = (dailyPnL[d] || 0) + t.pnl;
  });

  const recentTrades = closedTrades.slice(-10).reverse();

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="text-light-primary dark:text-dark-primary" />
              Performance Analytics
            </h1>
            <p className="text-sm text-text-secondary">
              Analyze your trading patterns and improve your strategy
            </p>
          </div>

          {/* TIME PERIOD */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-text-secondary mr-2">TIME PERIOD</span>
            {["Today", "7 Days", "30 Days", "3 Months", "1 Year", "All Time"].map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setPeriod(t as Period)}
                  className={`px-3 py-1.5 rounded-lg border ${
                    period === t
                      ? "bg-light-primary text-white border-light-primary"
                      : "border-border hover:bg-border-light"
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>

          {/* TRADE FILTER */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary mr-1">FILTER BY</span>
            <button
              onClick={() => setTradeFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg ${
                tradeFilter === "ALL"
                  ? "bg-light-primary text-white"
                  : "border border-border hover:bg-border-light"
              }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setTradeFilter("WINNERS")}
              className={`px-3 py-1.5 rounded-lg border ${
                tradeFilter === "WINNERS"
                  ? "bg-light-primary text-white"
                  : "border-border hover:bg-border-light"
              }`}
            >
              Winners
            </button>
            <button
              onClick={() => setTradeFilter("LOSERS")}
              className={`px-3 py-1.5 rounded-lg border ${
                tradeFilter === "LOSERS"
                  ? "bg-light-primary text-white"
                  : "border-border hover:bg-border-light"
              }`}
            >
              Losers
            </button>
          </div>
        </div>
      </div>

      {/* ================= TOP STATS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat title="TOTAL P&L" value={`$${totalPnL.toFixed(2)}`} icon={DollarSign} />
        <Stat title="WIN RATE" value={`${winRate.toFixed(1)}%`} icon={Percent} />
        <Stat title="PROFIT FACTOR" value={profitFactor.toFixed(2)} icon={BarChart3} />
        <Stat title="EXPECTANCY" value={`$${expectancy.toFixed(2)}`} icon={TrendingUp} />
      </section>

      {/* ================= QUICK STATS + EQUITY ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MiniStat label="Avg Winner" value={`$${avgWinner.toFixed(2)}`} />
            <MiniStat label="Avg Loser" value={`-$${avgLoser.toFixed(2)}`} danger />
            <MiniStat label="Best Trade" value={`$${bestTrade.toFixed(2)}`} />
            <MiniStat label="Worst Trade" value={`$${worstTrade.toFixed(2)}`} danger />
            <MiniStat label="Win Streak" value={`${maxWinStreak} trades`} />
            <MiniStat label="Loss Streak" value={`${maxLossStreak} trades`} />
            <MiniStat label="Risk:Reward" value={`1:${avgLoser === 0 ? "0.00" : (avgWinner / avgLoser).toFixed(2)}`} />
            <MiniStat label="Open Trades" value={`${openTrades.length}`} />
          </div>
        </div>

        <div className="xl:col-span-2 card p-5 flex flex-col">
          <h3 className="font-semibold mb-2">Equity Curve</h3>
          <p className="text-sm text-text-secondary mb-4">
            Cumulative P&L progression
          </p>
          <div className="flex-1 flex items-center justify-center text-text-secondary border border-dashed border-border rounded-lg">
            {closedTrades.length === 0
              ? "Complete trades to see your equity curve"
              : `Equity Points: ${closedTrades.length}`}
          </div>
        </div>
      </section>

      {/* ================= LONG vs SHORT ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Long vs Short</h3>
          <div className="space-y-3 text-sm">
            <DirectionCard title="Long" trades={longTrades.length} pnl={longPnL} win={longWinRate} />
            <DirectionCard title="Short" trades={shortTrades.length} pnl={shortPnL} win={shortWinRate} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Day Performance</h3>
          {Object.entries(dayMap).map(([d, v]) => (
            <div key={d} className="flex items-center justify-between text-sm py-1">
              <span>{d}</span>
              <span className={v >= 0 ? "text-light-primary" : "text-red-500"}>
                ${v.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="card p-5 flex items-center justify-center text-text-secondary">
          No symbol data yet
        </div>
      </section>

      {/* ================= CALENDAR ================= */}
      <section className="card p-5 mt-6">
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {Array.from({ length: 31 }).map((_, i) => {
            const pnl = dailyPnL[i + 1];
            return (
              <div
                key={i}
                className={`h-12 rounded-lg bg-border-light flex items-center justify-center ${
                  pnl > 0 ? "text-green-500" : pnl < 0 ? "text-red-500" : ""
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= BOTTOM ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Win/Loss Distribution</h3>
          <div className="mt-4 space-y-2 text-sm">
            <Line label="Gross Profit" value={`$${grossProfit.toFixed(2)}`} />
            <Line label="Gross Loss" value={`-$${grossLoss.toFixed(2)}`} danger />
            <Line label="Net Result" value={`$${totalPnL.toFixed(2)}`} />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock size={16} /> Recent Trades
          </h3>
          <p className="text-sm text-text-secondary">
            {recentTrades.length === 0
              ? "No recent trades"
              : `${recentTrades.length} trades`}
          </p>
        </div>
      </section>
    </>
  );
}

/* ================= UI HELPERS (UNCHANGED) ================= */

function Stat({ title, value, icon: Icon, danger }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-secondary">{title}</span>
        <Icon size={18} />
      </div>
      <p className={`text-2xl font-semibold ${danger && "text-red-500"}`}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value, danger }: any) {
  return (
    <div className="bg-border-light rounded-lg p-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={`font-semibold ${danger && "text-red-500"}`}>{value}</p>
    </div>
  );
}

function DirectionCard({ title, trades, pnl, win }: any) {
  return (
    <div className="border border-border rounded-lg p-4">
      <p className="font-medium mb-2">{title}</p>
      <div className="grid grid-cols-3 text-xs text-text-secondary">
        <span>Trades</span>
        <span>P&L</span>
        <span>Win %</span>
      </div>
      <div className="grid grid-cols-3 font-medium text-sm mt-1">
        <span>{trades}</span>
        <span className="text-light-primary">${pnl.toFixed(2)}</span>
        <span>{win.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function Line({ label, value, danger }: any) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={danger ? "text-red-500" : ""}>{value}</span>
    </div>
  );
}
