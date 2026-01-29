import { useState } from "react";
import { Filter, Plus, X, Calendar } from "lucide-react";
import AddTradeModal from "../components/AddTradeModal";

export default function Trades() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addTradeOpen, setAddTradeOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* =====================
          PAGE HEADER
      ===================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Trades</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddTradeOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Add Trade
          </button>
        </div>
      </div>

      {/* =====================
          TRADE HISTORY CARD
      ===================== */}
      <div className="card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            Trade History{" "}
            <span className="text-text-secondary font-normal text-sm">
              0 of 0 trades
            </span>
          </h3>

          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* =====================
            FILTER PANEL
        ===================== */}
        {filtersOpen && (
          <div className="mb-6 rounded-xl border border-border bg-background p-5 space-y-5">
            {/* P&L */}
            <FilterGroup label="P&L">
              <FilterButton active>All</FilterButton>
              <FilterButton>Profitable (0)</FilterButton>
              <FilterButton>Loss (0)</FilterButton>
            </FilterGroup>

            {/* TYPE */}
            <FilterGroup label="Type">
              <FilterButton active>All</FilterButton>
              <FilterButton>Long</FilterButton>
              <FilterButton>Short</FilterButton>
            </FilterGroup>

            {/* TIME PERIOD */}
            <FilterGroup label="Time Period">
              <FilterButton>All Time</FilterButton>
              <FilterButton>Today</FilterButton>
              <FilterButton>This Week</FilterButton>
              <FilterButton active>This Month</FilterButton>
              <FilterButton>Last Month</FilterButton>
              <FilterButton>Last 3 Months</FilterButton>
              <FilterButton icon={<Calendar size={14} />}>
                Custom
              </FilterButton>
            </FilterGroup>

            {/* Clear */}
            <div className="flex justify-end">
              <button className="text-sm text-text-secondary flex items-center gap-2 hover:text-text">
                <X size={14} />
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* =====================
            TABLE
        ===================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="py-2 text-left font-medium">DATE</th>
                <th className="py-2 text-left font-medium">SYMBOL</th>
                <th className="py-2 text-left font-medium">TYPE</th>
                <th className="py-2 text-left font-medium">ENTRY</th>
                <th className="py-2 text-left font-medium">EXIT</th>
                <th className="py-2 text-left font-medium">SIZE</th>
                <th className="py-2 text-left font-medium">P&amp;L</th>
                <th className="py-2 text-left font-medium">SOURCE</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-text-secondary">
                    <Filter size={28} />
                    <p>No trades match your filters</p>
                    <button className="btn-secondary text-sm">
                      Clear Filters
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================
          ADD TRADE MODAL
      ===================== */}
      {addTradeOpen && (
        <AddTradeModal onClose={() => setAddTradeOpen(false)} />
      )}
    </div>
  );
}

/* =====================
   SMALL UI COMPONENTS
===================== */

function FilterGroup({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase text-text-secondary">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  icon
}: {
  children: React.ReactNode;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2
        ${
          active
            ? "bg-primary/20 text-primary"
            : "border border-border hover:bg-border-light"
        }`}
    >
      {icon}
      {children}
    </button>
  );
}
