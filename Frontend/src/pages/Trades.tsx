import { useEffect, useState } from "react";
import { Plus, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

/* =====================
   TYPES
===================== */

interface Journal {
  preTrade: string;
  postTrade: string;
  emotions: string;
  lessons: string;
  tags: string;
  rating: number;
  checklist: Record<string, boolean>;
  screenshots?: string[];
}

interface Trade {
  _id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number | null;
  lotSize: number;
  pnl: number;
  entryDate: string;
  journal?: Journal;
}

/* =====================
   MAIN PAGE
===================== */

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =====================
     FETCH TRADES
  ===================== */
  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await API.get("/trades");
      setTrades(res.data);
    } catch {
      toast.error("Failed to load trades");
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
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER (FIXED, NOT SCROLLING) */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Trades</h1>
        <button
          onClick={() => navigate("/trades/add")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Trade
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="card p-0 overflow-hidden">
        {/* SCROLL CONTAINER */}
        <div className="max-h-[520px] overflow-y-auto">
          <table className="w-full text-sm border-collapse">
            {/* STICKY HEADER */}
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b border-border text-text-secondary">
                <th className="py-3 px-5 text-left">DATE</th>
                <th className="py-3 px-5 text-left">SYMBOL</th>
                <th className="py-3 px-5 text-left">TYPE</th>
                <th className="py-3 px-5 text-left">ENTRY</th>
                <th className="py-3 px-5 text-left">EXIT</th>
                <th className="py-3 px-5 text-left">LOT</th>
                <th className="py-3 px-5 text-left">P&amp;L</th>
                <th className="py-3 px-5 text-left">STATUS</th>
                <th className="py-3 px-5 text-center">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center">
                    Loading...
                  </td>
                </tr>
              ) : trades.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-20 text-center text-text-secondary"
                  >
                    No trades found
                  </td>
                </tr>
              ) : (
                trades.map((t) => {
                  const hasJournal = Boolean(t.journal);

                  return (
                    <tr
                      key={t._id}
                      className="border-b border-border hover:bg-border-light transition"
                    >
                      <td className="py-3 px-5">
                        {new Date(t.entryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-5 font-medium">{t.symbol}</td>
                      <td className="py-3 px-5">{t.type}</td>
                      <td className="py-3 px-5">{t.entryPrice}</td>
                      <td className="py-3 px-5">{t.exitPrice ?? "-"}</td>
                      <td className="py-3 px-5">{t.lotSize}</td>

                      {/* P&L COLOR */}
                      <td
                        className={`py-3 px-5 font-semibold ${
                          t.pnl >= 0 ? "text-blue-600" : "text-red-500"
                        }`}
                      >
                        {t.pnl}
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-5">
                        {hasJournal ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            Journaled
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-500">
                            Not Journaled
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-5">
                        <div className="flex justify-center gap-3">
                          <button
                            disabled={!hasJournal}
                            onClick={() =>
                              hasJournal && navigate(`/trades/${t._id}`)
                            }
                            className={`w-9 h-9 flex items-center justify-center rounded-lg
                              ${
                                hasJournal
                                  ? "hover:bg-border-light"
                                  : "opacity-40 cursor-not-allowed"
                              }`}
                          >
                            <Eye size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(t._id)}
                            className="w-9 h-9 flex items-center justify-center rounded-lg
                              text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
