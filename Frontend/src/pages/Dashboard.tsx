import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Target,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import StatCard from "../components/StatCard";

interface Trade {
  _id?: string;
  symbol?: string;
  pnl: number;
  status: "OPEN" | "CLOSED";
  entryDate: string;
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  /* =====================
     FETCH TRADES
  ===================== */
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await API.get("/trades");
        setTrades(res.data || []);
      } catch (err: any) {
        toast.error("Failed to load dashboard data");
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

  const wins = closedTrades.filter(t => t.pnl > 0);
  const losses = closedTrades.filter(t => t.pnl < 0);

  const winRate =
    closedTrades.length === 0
      ? 0
      : Math.round((wins.length / closedTrades.length) * 100);

  const bestTrade =
    closedTrades.length === 0
      ? 0
      : Math.max(...closedTrades.map(t => t.pnl));

  const worstTrade =
    closedTrades.length === 0
      ? 0
      : Math.min(...closedTrades.map(t => t.pnl));

  /* =====================
     DAILY PNL MAP
  ===================== */
  const dailyPnL: Record<number, number> = {};
  const dailyTrades: Record<number, Trade[]> = {};

  closedTrades.forEach(trade => {
    const day = new Date(trade.entryDate).getDate();
    dailyPnL[day] = (dailyPnL[day] || 0) + trade.pnl;
    dailyTrades[day] = [...(dailyTrades[day] || []), trade];
  });

  const selectedDayTrades =
    selectedDay !== null ? dailyTrades[selectedDay] || [] : [];

  if (loading) return null;

  return (
    <>
      {/* =====================
          TOP STATS
      ===================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="TOTAL P&L"
          value={`${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`}
          subtitle={`${closedTrades.length} closed trades`}
          icon={DollarSign}
          valueClass={totalPnL >= 0 ? "text-emerald-500" : "text-rose-500"}
        />

        <StatCard
          title="WIN RATE"
          value={`${winRate}%`}
          icon={Target}
          footer={
            <div className="mt-3 h-2 w-full bg-border-light rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500"
                style={{ width: `${winRate}%` }}
              />
            </div>
          }
        />

        <StatCard
          title="BEST / WORST"
          value={
            <span className="flex gap-3">
              <span className="text-emerald-500">
                +${bestTrade.toFixed(2)}
              </span>
              <span className="text-rose-500">
                ${worstTrade.toFixed(2)}
              </span>
            </span>
          }
          icon={TrendingUp}
        />
      </section>

      {/* =====================
          MAIN GRID
      ===================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Performance Placeholder */}
        <div className="xl:col-span-2 card p-5">
          <h3 className="font-semibold mb-4">Performance Overview</h3>
          <div className="h-64 rounded-xl border border-dashed border-border flex items-center justify-center text-text-secondary">
            Equity curve / performance chart
          </div>
        </div>

        {/* Monthly P&L Calendar */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Monthly P&amp;L</h3>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const pnl = dailyPnL[day];
              const hasTrade = pnl !== undefined;

              return (
                <button
                  key={day}
                  onClick={() => {
                    if (hasTrade) {
                      setSelectedDay(day);
                      setShowModal(true);
                    }
                  }}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center transition
                    ${
                      hasTrade
                        ? pnl >= 0
                          ? "bg-emerald-500/15 hover:bg-emerald-500/25"
                          : "bg-rose-500/15 hover:bg-rose-500/25"
                        : "bg-border-light"
                    }
                  `}
                >
                  <span className="font-medium">{day}</span>
                  {hasTrade && (
                    <span
                      className={`font-semibold ${
                        pnl >= 0 ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      ${pnl.toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================
          MODAL – DAILY TRADES
      ===================== */}
      {showModal && selectedDay !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface rounded-2xl border border-border shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">
                Trades on {selectedDay}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-border-light"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedDayTrades.map((trade, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-border-light"
                >
                  <div>
                    <p className="font-medium">
                      {trade.symbol || "Trade"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(trade.entryDate).toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`font-semibold ${
                      trade.pnl >= 0
                        ? "text-emerald-500"
                        : "text-rose-500"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                  </div>
                </div>
              ))}

              {selectedDayTrades.length === 0 && (
                <p className="text-center text-sm text-text-secondary">
                  No trades on this day
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
