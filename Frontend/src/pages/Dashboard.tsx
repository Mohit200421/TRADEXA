import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { DollarSign, Target } from "lucide-react";
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

  /* =====================
     FETCH TRADES
  ===================== */
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await API.get("/trades");
        setTrades(res.data || []);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to load dashboard data"
        );
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

  const avgWin =
    winningTrades.length === 0
      ? 0
      : winningTrades.reduce((s, t) => s + t.pnl, 0) /
        winningTrades.length;

  const avgLoss =
    losingTrades.length === 0
      ? 0
      : losingTrades.reduce((s, t) => s + t.pnl, 0) /
        losingTrades.length;

  const bestTrade =
    closedTrades.length === 0
      ? 0
      : Math.max(...closedTrades.map(t => t.pnl));

  const worstTrade =
    closedTrades.length === 0
      ? 0
      : Math.min(...closedTrades.map(t => t.pnl));

  /* =====================
     MONTHLY P&L (DATE WISE)
  ===================== */
  const dailyPnL: Record<number, number> = {};

  closedTrades.forEach(trade => {
    const day = new Date(trade.entryDate).getDate();
    dailyPnL[day] = (dailyPnL[day] || 0) + trade.pnl;
  });

  if (loading) return null;

  return (
    <>
      {/* =====================
          TOP STAT CARDS
      ===================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
        {/* TOTAL P&L */}
        <StatCard
          title="TOTAL P&L"
          value={`${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`}
          subtitle={`${closedTrades.length} trades`}
          icon={DollarSign}
          valueClass={
            totalPnL >= 0 ? "text-green-500" : "text-red-500"
          }
        />

        {/* WIN RATE */}
        <StatCard
          title="WIN RATE"
          value={`${winRate}%`}
          icon={Target}
          footer={
            <div className="mt-3 h-2 w-full bg-border-light rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${winRate}%` }}
              />
            </div>
          }
        />
      </section>

      {/* =====================
          PERFORMANCE + MONTHLY P&L
      ===================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Performance */}
        <div className="xl:col-span-2 card p-5">
          <h3 className="font-semibold mb-4">Performance</h3>

          <div className="h-64 flex items-center justify-center text-text-secondary border border-dashed border-border rounded-lg">
            Performance chart
          </div>
        </div>

        {/* Monthly P&L */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Monthly P&amp;L</h3>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const pnl = dailyPnL[day];
              const hasTrade = pnl !== undefined;

              return (
                <div
                  key={day}
                  className="h-10 rounded-lg flex flex-col justify-center items-center bg-border-light"
                >
                  <span className="font-medium">{day}</span>
                  {hasTrade && (
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
      </section>

      {/* =====================
          BOTTOM SECTION
      ===================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Open Positions</h3>
          <p className="text-sm text-text-secondary">
            No open positions
          </p>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">Top Performers</h3>
          <p className="text-sm text-text-secondary">
            {bestTrade > 0
              ? `Best trade: $${bestTrade.toFixed(2)}`
              : "No trading data yet"}
          </p>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Quick Stats</h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <QuickStat label="Avg Win" value={`$${avgWin.toFixed(2)}`} />
            <QuickStat label="Avg Loss" value={`$${avgLoss.toFixed(2)}`} />
            <QuickStat label="Best Trade" value={`$${bestTrade.toFixed(2)}`} />
            <QuickStat label="Worst Trade" value={`$${worstTrade.toFixed(2)}`} />
          </div>
        </div>
      </section>
    </>
  );
}

/* =====================
   SMALL COMPONENT
===================== */
function QuickStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-border-light p-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
