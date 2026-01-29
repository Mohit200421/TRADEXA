import StatCard from "../components/StatCard";
import { DollarSign, Clock, CheckCircle, Target } from "lucide-react";

export default function Dashboard() {
  return (
    <>
      {/* =====================
          TOP STAT CARDS
      ===================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL P&L"
          value="+$0.00"
          subtitle="0 trades"
          icon={DollarSign}
        />

        <StatCard
          title="UNREALIZED"
          value="+$0.00"
          subtitle="0 open positions"
          icon={Clock}
        />

        <StatCard
          title="REALIZED"
          value="+$0.00"
          subtitle="0 closed trades"
          icon={CheckCircle}
        />

        <StatCard
          title="WIN RATE"
          value="0%"
          icon={Target}
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

          <div className="grid grid-cols-7 gap-2 text-xs text-center">
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-border-light"
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================
          BOTTOM SECTION
      ===================== */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Open Positions */}
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Open Positions</h3>
          <p className="text-sm text-text-secondary">
            No open positions
          </p>
        </div>

        {/* Top Performers */}
        <div className="card p-5">
          <h3 className="font-semibold mb-3">Top Performers</h3>
          <p className="text-sm text-text-secondary">
            No trading data yet
          </p>
        </div>

        {/* Quick Stats */}
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Quick Stats</h3>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <QuickStat label="Avg Win" value="+$0.00" />
            <QuickStat label="Avg Loss" value="+$0.00" />
            <QuickStat label="Best Trade" value="+$0.00" />
            <QuickStat label="Worst Trade" value="+$0.00" />
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
  value
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
