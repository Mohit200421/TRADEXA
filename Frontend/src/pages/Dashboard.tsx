import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { DollarSign, Target, TrendingUp } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

interface Trade {
  pnl: number;
  status: "OPEN" | "CLOSED";
  entryDate: string;
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  /* =====================
     FETCH TRADES
  ===================== */
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await API.get("/trades");
        setTrades(res.data || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  /* =====================
     CALCULATIONS
  ===================== */
  const closedTrades = useMemo(
    () => trades.filter(t => t.status === "CLOSED"),
    [trades]
  );

  const totalPnL = useMemo(
    () => closedTrades.reduce((sum, t) => sum + t.pnl, 0),
    [closedTrades]
  );

  const winningTrades = closedTrades.filter(t => t.pnl > 0);
  const losingTrades = closedTrades.filter(t => t.pnl < 0);

  const winRate =
    closedTrades.length === 0
      ? 0
      : Math.round((winningTrades.length / closedTrades.length) * 100);

  const totalProfit = winningTrades.reduce((s, t) => s + t.pnl, 0);
  const totalLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0));

  const profitFactor =
    totalLoss === 0 ? null : (totalProfit / totalLoss).toFixed(2);

  const bestTradeObj =
    closedTrades.length === 0
      ? null
      : closedTrades.reduce((best, t) =>
          t.pnl > best.pnl ? t : best
        );

  /* =====================
     MONTHLY P&L (DATE WISE)
  ===================== */
  const dailyTrades: Record<number, Trade[]> = {};

  closedTrades.forEach(trade => {
    const day = new Date(trade.entryDate).getDate();
    if (!dailyTrades[day]) dailyTrades[day] = [];
    dailyTrades[day].push(trade);
  });

  if (loading) return null;

  return (
    <>
      {/* =====================
          TOP STATS
      ===================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="TOTAL P&L"
          value={`${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`}
          subtitle={`${closedTrades.length} trades`}
          icon={DollarSign}
          valueClass={totalPnL >= 0 ? "text-green-500" : "text-red-500"}
        />

        <StatCard title="WIN RATE" value={`${winRate}%`} icon={Target} />

        <StatCard
          title="PROFIT FACTOR"
          value={profitFactor ? profitFactor : "--"}
          icon={TrendingUp}
          valueClass={
            profitFactor && Number(profitFactor) >= 1
              ? "text-green-500"
              : "text-red-500"
          }
        />
      </section>

      {/* =====================
          MONTHLY P&L
      ===================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 card p-5">
          <h3 className="font-semibold mb-4">Monthly P&amp;L</h3>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const tradesForDay = dailyTrades[day];
              const pnl =
                tradesForDay?.reduce((s, t) => s + t.pnl, 0) ?? null;

              return (
                <div
                  key={day}
                  onClick={() => tradesForDay && setSelectedDay(day)}
                  className={`h-12 rounded-lg flex flex-col justify-center items-center cursor-pointer transition
                    ${pnl === null ? "bg-border-light" :
                      pnl >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}
                >
                  <span className="font-medium">{day}</span>
                  {pnl !== null && (
                    <span
                      className={`font-semibold ${
                        pnl >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      ${pnl.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =====================
            TOP PERFORMANCE
        ===================== */}
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Top Performance</h3>

          {bestTradeObj ? (
            <div className="rounded-lg bg-green-500/10 p-4">
              <p className="text-sm text-text-secondary">Best Trade</p>
              <p className="text-xl font-semibold text-green-500">
                +${bestTradeObj.pnl.toFixed(2)}
              </p>
              <p className="text-xs text-text-secondary">
                {new Date(bestTradeObj.entryDate).toDateString()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">
              No trades yet
            </p>
          )}
        </div>
      </section>

      {/* =====================
          QUICK STATS
      ===================== */}
      <section className="card p-5 mt-6">
        <h3 className="font-semibold mb-4">Quick Stats</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <QuickStat label="Total Trades" value={closedTrades.length} />
          <QuickStat label="Winning Trades" value={winningTrades.length} />
          <QuickStat label="Losing Trades" value={losingTrades.length} />
          <QuickStat label="Profit Factor" value={profitFactor ?? "--"} />
        </div>
      </section>

      {/* =====================
          DAY TRADES MODAL
      ===================== */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-bg rounded-lg p-6 w-full max-w-md">
            <h3 className="font-semibold mb-3">
              Trades on Day {selectedDay}
            </h3>

            <div className="space-y-2">
              {dailyTrades[selectedDay].map((t, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b pb-1"
                >
                  <span>{new Date(t.entryDate).toLocaleTimeString()}</span>
                  <span
                    className={t.pnl >= 0 ? "text-green-500" : "text-red-500"}
                  >
                    ${t.pnl.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="mt-4 w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* =====================
   SMALL COMPONENT
===================== */
function QuickStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg bg-border-light p-4 text-center">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
}
