import { useEffect, useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import {
  DollarSign,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

/* =====================
   TYPES
===================== */
interface Trade {
  pnl: number;
  status: "OPEN" | "CLOSED";
  entryDate: string;
  symbol: string; // ✅ REQUIRED
}

/* =====================
   HELPERS
===================== */
function getLocalDateKey(dateStr: string) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  /* =====================
     MONTHLY P&L STATE
  ===================== */
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
     STATS CALCULATIONS
  ===================== */
  const closedTrades = useMemo(
    () => trades.filter(t => t.status === "CLOSED"),
    [trades]
  );

  const totalPnL = closedTrades.reduce((s, t) => s + t.pnl, 0);

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
     MONTHLY P&L DATA
  ===================== */
  const monthTrades = useMemo(() => {
    return closedTrades.filter(t => {
      const d = new Date(t.entryDate);
      return (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      );
    });
  }, [closedTrades, currentMonth]);

  const dailyTrades: Record<string, Trade[]> = {};
  monthTrades.forEach(trade => {
    const key = getLocalDateKey(trade.entryDate);
    if (!dailyTrades[key]) dailyTrades[key] = [];
    dailyTrades[key].push(trade);
  });

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOffset =
    (new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay() + 6) % 7;

  const monthKey = `${currentMonth.getFullYear()}-${String(
    currentMonth.getMonth() + 1
  ).padStart(2, "0")}`;

  if (loading) return null;

  return (
    <>
      {/* =====================
          TOP STATS (CUSTOM UI)
      ===================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TOTAL P&L */}
        <div className="card p-5 relative">
          <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
            TOTAL
          </span>

          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            <DollarSign className="text-blue-600" />
          </div>

          <p className="text-sm text-text-secondary">TOTAL P&amp;L</p>
          <p
  className={`text-3xl font-bold ${
    totalPnL >= 0 ? "text-blue-600" : "text-red-500"
  }`}
>
  {totalPnL >= 0 ? "+" : ""}${Math.abs(totalPnL).toFixed(2)}
</p>


          <p className="text-sm text-text-secondary mt-2">
            → {closedTrades.length} trades
          </p>
        </div>

        {/* WIN RATE */}
        <div className="card p-5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            <Target className="text-purple-600" />
          </div>

          <p className="text-sm text-text-secondary">WIN RATE</p>
          <p className="text-3xl font-bold">{winRate}%</p>

          <div className="w-full h-2 bg-border-light rounded-full mt-3">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* PROFIT FACTOR */}
        <div className="card p-5">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
            <TrendingUp className="text-green-600" />
          </div>

          <p className="text-sm text-text-secondary">PROFIT FACTOR</p>
          <p className="text-3xl font-bold">
            {profitFactor ?? "--"}
          </p>

          <p className="text-xs text-text-secondary mt-2">
            Higher is better
          </p>
        </div>
      </section>

      {/* =====================
          MONTHLY P&L
      ===================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* CALENDAR */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <div>
                <h3 className="font-semibold">Trading Calendar</h3>
                <p className="text-xs text-text-secondary">
                  Daily P&amp;L heatmap – Click on days to see trades
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="w-8 h-8 rounded-md bg-border-light hover:bg-border flex items-center justify-center"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                ‹
              </button>

              <span className="font-medium text-sm">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>

              <button
                className="w-8 h-8 rounded-md bg-border-light hover:bg-border flex items-center justify-center"
                onClick={() =>
                  setCurrentMonth(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                ›
              </button>
            </div>
          </div>

          {/* WEEKDAYS */}
          <div className="grid grid-cols-7 text-xs font-medium text-center mb-2">
            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={i} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${monthKey}-${String(day).padStart(2, "0")}`;
              const tradesForDay = dailyTrades[dateKey];
              const pnl =
                tradesForDay?.reduce((s, t) => s + t.pnl, 0) ?? null;

              return (
                <div
                  key={dateKey}
                  onClick={() => tradesForDay && setSelectedDate(dateKey)}
                  className={`h-16 rounded-lg border p-2 cursor-pointer
                    ${
                      pnl === null
                        ? "bg-bg"
                        : pnl >= 0
                        ? "border-blue-500"
                        : "border-red-500"
                    }
                    ${
                      selectedDate === dateKey
                        ? "ring-2 ring-primary"
                        : ""
                    }
                  `}
                >
                  <div className="text-sm font-medium">{day}</div>
                  {pnl !== null && (
                    <div
                      className={`text-xs font-semibold mt-1 ${
                        pnl >= 0 ? "text-blue-500" : "text-red-500"
                      }`}
                    >
                      {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DAY TRADES */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Day Trades</h3>

          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-60 text-text-secondary text-sm">
              <Calendar size={36} className="mb-2 opacity-50" />
              Click on a day with trades to view details
            </div>
          ) : (
            <>
              <p className="text-xs text-text-secondary mb-3">
                {new Date(selectedDate).toDateString()}
              </p>

              <div className="space-y-3 max-h-80 overflow-auto">
                {dailyTrades[selectedDate].map((t, i) => (
                  <div
                    key={i}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-semibold">
                        Trade #{i + 1} · {t.symbol}
                      </p>
                      <p
                        className={`font-semibold text-lg ${
                          t.pnl >= 0
                            ? "text-blue-600"
                            : "text-red-500"
                        }`}
                      >
                        {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                      </p>
                    </div>

                    <p className="text-xs text-text-secondary">
                      Status: {t.status}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Time:{" "}
                      {new Date(t.entryDate).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* =====================
          TOP PERFORMANCE
      ===================== */}
      <section className="card p-5 mt-6">
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
