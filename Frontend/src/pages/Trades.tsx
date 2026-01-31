import { useEffect, useMemo, useState } from "react";
import { Filter, Plus, X, Calendar, Trash2 } from "lucide-react";
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

type PnlFilter = "ALL" | "PROFIT" | "LOSS";
type TypeFilter = "ALL" | "LONG" | "SHORT";
type TimeFilter = "ALL" | "MONTH";

export default function Trades() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addTradeOpen, setAddTradeOpen] = useState(false);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 filter state
  const [pnlFilter, setPnlFilter] = useState<PnlFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALL");

  /* =====================
     FETCH TRADES
  ===================== */
  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await API.get("/trades");
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

  /* =====================
     DELETE TRADE
  ===================== */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trade?")) return;

    try {
      await API.delete(`/trades/${id}`);
      toast.success("Trade deleted");
      setTrades((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* =====================
     FILTER LOGIC
  ===================== */
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      // P&L filter
      if (pnlFilter === "PROFIT" && t.pnl <= 0) return false;
      if (pnlFilter === "LOSS" && t.pnl >= 0) return false;

      // Type filter
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;

      // Time filter
      if (timeFilter === "MONTH") {
        const d = new Date(t.entryDate);
        const now = new Date();
        if (
          d.getMonth() !== now.getMonth() ||
          d.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [trades, pnlFilter, typeFilter, timeFilter]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold">Trades</h1>

        <button
          onClick={() => setAddTradeOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Trade
        </button>
      </div>

      {/* CARD */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            Trade History{" "}
            <span className="text-text-secondary font-normal text-sm">
              {filteredTrades.length} trades
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

        {/* FILTERS */}
        {filtersOpen && (
          <div className="mb-6 rounded-xl border border-border bg-background p-5 space-y-5">
            <FilterGroup label="P&L">
              <FilterButton
                active={pnlFilter === "ALL"}
                onClick={() => setPnlFilter("ALL")}
              >
                All
              </FilterButton>
              <FilterButton
                active={pnlFilter === "PROFIT"}
                onClick={() => setPnlFilter("PROFIT")}
              >
                Profitable
              </FilterButton>
              <FilterButton
                active={pnlFilter === "LOSS"}
                onClick={() => setPnlFilter("LOSS")}
              >
                Loss
              </FilterButton>
            </FilterGroup>

            <FilterGroup label="Type">
              <FilterButton
                active={typeFilter === "ALL"}
                onClick={() => setTypeFilter("ALL")}
              >
                All
              </FilterButton>
              <FilterButton
                active={typeFilter === "LONG"}
                onClick={() => setTypeFilter("LONG")}
              >
                Long
              </FilterButton>
              <FilterButton
                active={typeFilter === "SHORT"}
                onClick={() => setTypeFilter("SHORT")}
              >
                Short
              </FilterButton>
            </FilterGroup>

            <FilterGroup label="Time Period">
              <FilterButton
                active={timeFilter === "ALL"}
                onClick={() => setTimeFilter("ALL")}
              >
                All Time
              </FilterButton>
              <FilterButton
                active={timeFilter === "MONTH"}
                onClick={() => setTimeFilter("MONTH")}
              >
                This Month
              </FilterButton>
              <FilterButton icon={<Calendar size={14} />}>
                Custom
              </FilterButton>
            </FilterGroup>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setPnlFilter("ALL");
                  setTypeFilter("ALL");
                  setTimeFilter("ALL");
                }}
                className="text-sm text-text-secondary flex items-center gap-2 hover:text-text"
              >
                <X size={14} />
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-secondary">
                <th className="py-2 text-left">DATE</th>
                <th className="py-2 text-left">SYMBOL</th>
                <th className="py-2 text-left">TYPE</th>
                <th className="py-2 text-left">ENTRY</th>
                <th className="py-2 text-left">EXIT</th>
                <th className="py-2 text-left">LOT</th>
                <th className="py-2 text-left">P&amp;L</th>
                <th className="py-2"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-text-secondary">
                    No trades found
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t) => (
                  <tr key={t._id} className="border-b border-border">
                    <td className="py-2">
                      {new Date(t.entryDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 font-medium">{t.symbol}</td>
                    <td className="py-2">{t.type}</td>
                    <td className="py-2">{t.entryPrice}</td>
                    <td className="py-2">{t.exitPrice ?? "-"}</td>
                    <td className="py-2">{t.lotSize}</td>
                    <td
                      className={`py-2 font-medium ${
                        t.pnl >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {t.pnl}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addTradeOpen && (
        <AddTradeModal
          onClose={() => setAddTradeOpen(false)}
          onSuccess={fetchTrades}
        />
      )}
    </div>
  );
}

/* ---------- SMALL UI ---------- */

function FilterGroup({ label, children }: any) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase text-text-secondary">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterButton({ children, active, icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
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
