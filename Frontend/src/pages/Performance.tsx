
import {
  TrendingUp,
  DollarSign,
  Percent,
  BarChart3,
  Calendar,
  Clock
} from "lucide-react";

export default function Performance() {
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

          {/* Time period */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-text-secondary mr-2">TIME PERIOD</span>
            {["Today", "7 Days", "30 Days", "3 Months", "1 Year", "All Time"].map(
              (t) => (
                <button
                  key={t}
                  className={`px-3 py-1.5 rounded-lg border ${
                    t === "30 Days"
                      ? "bg-light-primary text-white border-light-primary"
                      : "border-border hover:bg-border-light"
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-secondary mr-1">FILTER BY</span>
            <button className="px-3 py-1.5 rounded-lg bg-light-primary text-white">
              All Trades
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-border-light">
              Winners
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-border hover:bg-border-light">
              Losers
            </button>
          </div>
        </div>
      </div>

      {/* ================= TOP STATS ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat title="TOTAL P&L" value="$0.00" icon={DollarSign} />
        <Stat title="WIN RATE" value="0.0%" icon={Percent} danger />
        <Stat title="PROFIT FACTOR" value="0.00" icon={BarChart3} danger />
        <Stat title="EXPECTANCY" value="$0.00" icon={TrendingUp} />
      </section>

      {/* ================= QUICK STATS + EQUITY ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Quick stats */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MiniStat label="Avg Winner" value="$0.00" />
            <MiniStat label="Avg Loser" value="-$0.00" danger />
            <MiniStat label="Best Trade" value="$0.00" />
            <MiniStat label="Worst Trade" value="$0.00" danger />
            <MiniStat label="Win Streak" value="0 trades" />
            <MiniStat label="Loss Streak" value="0 trades" />
            <MiniStat label="Risk:Reward" value="1:0.00" danger />
            <MiniStat label="Open Trades" value="0" />
          </div>
        </div>

        {/* Equity curve */}
        <div className="xl:col-span-2 card p-5 flex flex-col">
          <h3 className="font-semibold mb-2">Equity Curve</h3>
          <p className="text-sm text-text-secondary mb-4">
            Cumulative P&L progression
          </p>
          <div className="flex-1 flex items-center justify-center text-text-secondary border border-dashed border-border rounded-lg">
            Complete trades to see your equity curve
          </div>
        </div>
      </section>

      {/* ================= LONG vs SHORT ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Long vs Short</h3>

          <div className="space-y-3 text-sm">
            <DirectionCard title="Long" />
            <DirectionCard title="Short" />
          </div>
        </div>

        {/* Day performance */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Day Performance</h3>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="flex items-center justify-between text-sm py-1"
            >
              <span>{d}</span>
              <span className="text-light-primary">—</span>
            </div>
          ))}
        </div>

        {/* Top symbols */}
        <div className="card p-5 flex items-center justify-center text-text-secondary">
          No symbol data yet
        </div>
      </section>

      {/* ================= CALENDAR ================= */}
      <section className="card p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar size={18} /> Trading Calendar
            </h3>
            <p className="text-sm text-text-secondary">
              Daily P&L heatmap – Click on days to see trades
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button className="px-2 py-1 rounded border border-border">‹</button>
            <span>January 2026</span>
            <button className="px-2 py-1 rounded border border-border">›</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-border-light flex items-center justify-center"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </section>

      {/* ================= BOTTOM ================= */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Win/Loss Distribution</h3>
          <div className="h-12 rounded bg-border-light flex items-center justify-center text-sm">
            No closed trades
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <Line label="Gross Profit" value="$0.00" />
            <Line label="Gross Loss" value="-$0.00" danger />
            <Line label="Net Result" value="$0.00" />
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock size={16} /> Recent Trades
          </h3>
          <p className="text-sm text-text-secondary">Your last 10 trades</p>
          <div className="h-32 flex items-center justify-center text-text-secondary">
            No recent trades
          </div>
        </div>
      </section>
    </>
  );
}

/* ================= SMALL UI ================= */

function Stat({
  title,
  value,
  icon: Icon,
  danger
}: {
  title: string;
  value: string;
  icon: any;
  danger?: boolean;
}) {
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

function MiniStat({
  label,
  value,
  danger
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="bg-border-light rounded-lg p-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={`font-semibold ${danger && "text-red-500"}`}>{value}</p>
    </div>
  );
}

function DirectionCard({ title }: { title: string }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <p className="font-medium mb-2">{title}</p>
      <div className="grid grid-cols-3 text-xs text-text-secondary">
        <span>Trades</span>
        <span>P&L</span>
        <span>Win %</span>
      </div>
      <div className="grid grid-cols-3 font-medium text-sm mt-1">
        <span>0</span>
        <span className="text-light-primary">$0.00</span>
        <span>0.0%</span>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  danger
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={danger ? "text-red-500" : ""}>{value}</span>
    </div>
  );
}
