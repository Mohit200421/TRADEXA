import { useEffect, useState } from "react";
import { 
  Plus, 
  Trash2, 
  Eye, 
  Filter,
  Search,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Loader2,
  Edit,
  Download,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BookMarked,
  BookText,
  BarChart3
} from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "LONG" | "SHORT">("ALL");
  const [sortBy, setSortBy] = useState<"DATE" | "PNL" | "SYMBOL">("DATE");
  const [isGridView, setIsGridView] = useState(false);
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

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
    if (!confirm("Are you sure you want to delete this trade?")) return;
    try {
      await API.delete(`/trades/${id}`);
      toast.success("Trade deleted successfully");
      setTrades((prev) => prev.filter((t) => t._id !== id));
    } catch {
      toast.error("Failed to delete trade");
    }
  };

  /* =====================
     FILTER & SORT TRADES
  ===================== */
  const filteredTrades = trades
    .filter(trade => {
      // Search filter
      const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = filterType === "ALL" || trade.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "DATE":
          return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
        case "PNL":
          return b.pnl - a.pnl;
        case "SYMBOL":
          return a.symbol.localeCompare(b.symbol);
        default:
          return 0;
      }
    });

  /* =====================
     FORMAT CURRENCY
  ===================== */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  /* =====================
     FORMAT DATE
  ===================== */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Trades</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track and manage your trading history
          </p>
        </div>
        <button
          onClick={() => navigate("/trades/add")}
          className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white 
                   rounded-lg font-medium hover:opacity-90 transition-all duration-200 
                   flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Trade
        </button>
      </div>

      {/* FILTERS & CONTROLS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* SEARCH */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trades by symbol or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                         rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* FILTER & SORT CONTROLS */}
          <div className="flex items-center gap-2">
            {/* Type Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "ALL" | "LONG" | "SHORT")}
                className="appearance-none pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                         rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="LONG">Long Only</option>
                <option value="SHORT">Short Only</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "DATE" | "PNL" | "SYMBOL")}
                className="appearance-none pl-3 pr-8 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                         rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DATE">Sort by Date</option>
                <option value="PNL">Sort by P&L</option>
                <option value="SYMBOL">Sort by Symbol</option>
              </select>
              <TrendingUp className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              aria-label={isGridView ? "Switch to list view" : "Switch to grid view"}
            >
              {isGridView ? (
                <BarChart3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <BookText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* QUICK STATS BAR */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">{trades.filter(t => t.pnl > 0).length} Winning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">{trades.filter(t => t.pnl < 0).length} Losing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">{trades.filter(t => t.journal).length} Journaled</span>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading trades...</p>
        </div>
      ) : filteredTrades.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
            <TrendingUp className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No trades found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
            {searchTerm || filterType !== "ALL" 
              ? "Try adjusting your search or filters"
              : "Start by adding your first trade to track your performance"}
          </p>
          <button
            onClick={() => navigate("/trades/add")}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white 
                     rounded-lg font-medium hover:opacity-90 transition-all duration-200 
                     flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Your First Trade
          </button>
        </div>
      ) : isGridView ? (
        /* GRID VIEW (MOBILE FRIENDLY) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrades.map((trade) => {
            const hasJournal = Boolean(trade.journal);
            const isExpanded = expandedTrade === trade._id;

            return (
              <div
                key={trade._id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
                         overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Trade Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        trade.type === "LONG"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {trade.type}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{trade.symbol}</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      trade.pnl >= 0 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(trade.entryDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      {hasJournal ? (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <BookOpen className="w-3 h-3" />
                          <span className="text-xs">Journaled</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <BookMarked className="w-3 h-3" />
                          <span className="text-xs">No Journal</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trade Details */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(trade.entryPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exit Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {trade.exitPrice ? formatCurrency(trade.exitPrice) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lot Size</p>
                      <p className="font-medium text-gray-900 dark:text-white">{trade.lotSize}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {trade.exitPrice ? "Closed" : "Open"}
                      </p>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpandedTrade(isExpanded ? null : trade._id)}
                    className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 
                             dark:hover:text-gray-300 flex items-center justify-center gap-1"
                  >
                    {isExpanded ? "Show Less" : "Show Details"}
                    <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Trade ID</span>
                        <span className="font-mono text-xs text-gray-500">{trade._id.slice(-8)}</span>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={!hasJournal}
                          onClick={() => hasJournal && navigate(`/trades/${trade._id}`)}
                          className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                            hasJournal
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                              : "bg-gray-100 text-gray-400 dark:bg-gray-700 cursor-not-allowed"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          View Journal
                        </button>
                        <button
                          onClick={() => handleDelete(trade._id)}
                          className="px-3 py-1.5 rounded-lg text-sm bg-red-50 text-red-600 
                                   dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 
                                   dark:hover:bg-red-900/50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (DESKTOP) */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* SCROLL CONTAINER */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* STICKY HEADER */}
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    DATE
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    SYMBOL
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ENTRY
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    EXIT
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    LOT
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTrades.map((trade) => {
                  const hasJournal = Boolean(trade.journal);

                  return (
                    <tr key={trade._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">{formatDate(trade.entryDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">{trade.symbol}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          trade.type === "LONG"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {trade.type === "LONG" ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900 dark:text-white">{formatCurrency(trade.entryPrice)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900 dark:text-white">
                          {trade.exitPrice ? formatCurrency(trade.exitPrice) : "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900 dark:text-white">{trade.lotSize}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center gap-1 font-semibold ${
                          trade.pnl >= 0 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {trade.pnl >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {hasJournal ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs 
                                         bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            <BookOpen className="w-3 h-3" />
                            Journaled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs 
                                         bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                            <BookMarked className="w-3 h-3" />
                            No Journal
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            disabled={!hasJournal}
                            onClick={() => hasJournal && navigate(`/trades/${trade._id}`)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              hasJournal
                                ? "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            title={hasJournal ? "View Journal" : "No journal available"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/trades/edit/${trade._id}`)}
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 
                                     dark:text-gray-400 dark:hover:bg-gray-700"
                            title="Edit Trade"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(trade._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 
                                     dark:hover:bg-red-900/30 transition-colors"
                            title="Delete Trade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER WITH PAGINATION */}
          {filteredTrades.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center 
                          justify-between text-sm text-gray-600 dark:text-gray-400">
              <div>
                Showing <span className="font-medium">{filteredTrades.length}</span> of{" "}
                <span className="font-medium">{trades.length}</span> trades
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2">1</span>
                <button
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}