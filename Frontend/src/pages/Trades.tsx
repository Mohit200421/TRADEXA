import { useEffect, useState } from "react";
import { Filter, Plus, X, Calendar } from "lucide-react";
import AddTradeModal from "../components/AddTradeModal";
import API from "../api/axios";
import toast from "react-hot-toast";

interface Trade {
  _id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number | null;
  lotSize: number;
  pnl: number;
  entryDate: string;
}

export default function Trades() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addTradeOpen, setAddTradeOpen] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  /* =====================
     FETCH TRADES
  ===================== */
  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await API.get("/trades"); // ✅ IMPORTANT (no /api)
      setTrades(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

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
              {trades.length} trades
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
            FILTER PANEL (UI ONLY)
        ===================== */}
        {filtersOpen && (
          <div className="mb-6 rounded-xl border border-border bg-background p-5 space-y-5">
            <FilterGroup label="P&L">
              <FilterButton active>All</FilterButton>
              <FilterButton>Profitable</FilterButton>
              <FilterButton>Loss</FilterButton>
            </FilterGroup>

            <FilterGroup label="Type">
              <FilterButton active>All</FilterButton>
              <FilterButton>Long</FilterButton>
              <FilterButton>Short</FilterButton>
            </FilterGroup>

            <FilterGroup label="Time Period">
              <FilterButton>All Time</FilterButton>
              <FilterButton>This Month</FilterButton>
              <FilterButton icon={<Calendar size={14} />}>
                Custom
              </FilterButton>
            </FilterGroup>

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
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center">
                    Loading trades...
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-text-secondary">
                      <Filter size={28} />
                      <p>No trades added yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade._id} className="border-b border-border">
                    <td className="py-2">
                      {new Date(trade.entryDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 font-medium">{trade.symbol}</td>
                    <td className="py-2">{trade.type}</td>
                    <td className="py-2">{trade.entryPrice}</td>
                    <td className="py-2">
                      {trade.exitPrice ?? "-"}
                    </td>
                    <td className="py-2">{trade.lotSize}</td>
                    <td
                      className={`py-2 font-medium ${
                        trade.pnl >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {trade.pnl}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================
          ADD TRADE MODAL
      ===================== */}
      {addTradeOpen && (
        <AddTradeModal
          onClose={() => setAddTradeOpen(false)}
          onSuccess={fetchTrades} // 🔥 MAIN LINK
        />
      )}
    </div>
  );
}

/* =====================
   SMALL UI COMPONENTS
===================== */

function FilterGroup({
  label,
  children,
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
  icon,
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
