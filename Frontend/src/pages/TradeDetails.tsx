import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Share2,
  Calendar,
  Tag,
  CheckSquare,
  Camera,
  Loader2,
  AlertCircle,
  BarChart3,
  LineChart,
  CandlestickChart,
  Activity,
  ChevronLeft,
  MoreVertical,
  Edit3,
  Trash2,
  Download,
  Maximize2,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import ShareTradeModal from "../components/ShareTradeModal";

interface Trade {
  _id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  lotSize: number;
  pnl: number;
  date: string;
  journal?: {
    preTrade?: string;
    postTrade?: string;
    emotions?: string;
    lessons?: string;
    tags?: string;
    rating?: number;
    checklist?: Record<string, boolean>;
    screenshots?: string[];
  };
}

export default function TradeDetails() {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [username, setUsername] = useState("Trader");

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        setLoading(true);
        const res = await API.get("/trades");
        const found = res.data.find((t: Trade) => t._id === tradeId);

        if (!found) {
          toast.error("Trade not found");
          navigate("/trades");
          return;
        }

        setTrade(found);
      } catch (error) {
        console.error("Failed to load trade:", error);
        toast.error("Failed to load trade details");
      } finally {
        setLoading(false);
      }
    };

    // Fetch logged-in user from localStorage
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUsername(parsed.name || parsed.username || "Trader");
      } catch {
        // Keep default "Trader"
      }
    }

    if (tradeId) {
      fetchTrade();
    }
  }, [tradeId, navigate]);

  const handleShare = () => {
    setShowShareModal(true);
    setShowMobileMenu(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCompactDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!trade) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trade not found</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              The trade you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => navigate("/trades")}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all active:scale-95"
            >
              Back to Trades
            </button>
          </div>
        </div>
      </div>
    );
  }

  const j = trade.journal || {};
  const screenshots: string[] = j.screenshots || [];
  const isProfit = trade.pnl >= 0;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-black pb-8">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/trades")}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Trade Details</h1>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MoreVertical size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="absolute right-4 top-14 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 z-50">
              <button
                onClick={handleShare}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <Share2 size={16} />
                Share Trade
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Trade
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Trade
              </button>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/trades")}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Trades
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all active:scale-95"
            >
              <Share2 size={16} />
              Share Trade
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Header Section */}
            <div className={`relative p-4 sm:p-6 ${
              isProfit 
                ? 'bg-gradient-to-r from-blue-500/5 via-transparent to-transparent' 
                : 'bg-gradient-to-r from-red-500/5 via-transparent to-transparent'
            }`}>
              {/* Mobile View Header */}
              <div className="lg:hidden space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {trade.symbol}
                      </h1>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${trade.type === 'buy' 
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                          : 'bg-red-500/10 text-red-500 dark:text-red-400'
                        }`}
                      >
                        {trade.type.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      <Calendar size={12} />
                      <span>{formatCompactDate(trade.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400">P&L</p>
                      <p className={`text-lg font-bold ${
                        isProfit
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-500 dark:text-red-400"
                      }`}>
                        {isProfit ? '+' : ''}{formatCurrency(trade.pnl)}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${
                      isProfit
                        ? "bg-blue-500/10 dark:bg-blue-500/20"
                        : "bg-red-500/10 dark:bg-red-500/20"
                    }`}>
                      {isProfit ? (
                        <TrendingUp className={`w-5 h-5 ${
                          isProfit ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400"
                        }`} />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop View Header */}
              <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {trade.symbol}
                    </h1>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                      ${trade.type === 'buy' 
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                        : 'bg-red-500/10 text-red-500 dark:text-red-400'
                      }`}
                    >
                      {trade.type.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={14} />
                    <span>{formatDate(trade.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">P&L</p>
                    <p className={`text-2xl font-bold ${
                      isProfit
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-500 dark:text-red-400"
                    }`}>
                      {isProfit ? '+' : ''}{formatCurrency(trade.pnl)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    isProfit
                      ? "bg-blue-500/10 dark:bg-blue-500/20"
                      : "bg-red-500/10 dark:bg-red-500/20"
                  }`}>
                    {isProfit ? (
                      <TrendingUp className={`w-6 h-6 ${
                        isProfit ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400"
                      }`} />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-500 dark:text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - Mobile Optimized */}
            <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">Trade Details</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
                <Stat 
                  label="Entry" 
                  value={formatCurrency(trade.entryPrice)} 
                  tooltip="Entry price"
                  compact
                />
                <Stat 
                  label="Exit" 
                  value={trade.exitPrice ? formatCurrency(trade.exitPrice) : "-"} 
                  tooltip="Exit price"
                  compact
                />
                <Stat 
                  label="Lot Size" 
                  value={trade.lotSize} 
                  tooltip="Number of lots/shares"
                  compact
                />
                <Stat 
                  label="Type" 
                  value={trade.type.toUpperCase()} 
                  tooltip="Trade direction"
                  compact
                />
                <Stat 
                  label="Rating" 
                  value={j.rating ? `${j.rating}/10` : "-"} 
                  tooltip="Self-assessment rating"
                  compact
                />
                <Stat 
                  label="R/R" 
                  value={j.rating ? `${(j.rating / 5).toFixed(1)}` : "-"} 
                  tooltip="Risk/Reward ratio"
                  compact
                />
              </div>
            </div>

            {/* Journal Section - Responsive Grid */}
            {(j.preTrade || j.postTrade || j.emotions || j.lessons) && (
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">Journal Entries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                  {j.preTrade && (
                    <JournalCard title="Pre-Trade Plan" icon="📋">
                      {j.preTrade}
                    </JournalCard>
                  )}
                  {j.postTrade && (
                    <JournalCard title="Post-Trade Review" icon="🔍">
                      {j.postTrade}
                    </JournalCard>
                  )}
                  {j.emotions && (
                    <JournalCard title="Emotions" icon="💭">
                      {j.emotions}
                    </JournalCard>
                  )}
                  {j.lessons && (
                    <JournalCard title="Lessons Learned" icon="📚">
                      {j.lessons}
                    </JournalCard>
                  )}
                </div>
              </div>
            )}

            {/* Tags Section */}
            {j.tags && (
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Tag size={16} />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {j.tags.split(",").map((t: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-default"
                    >
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist Section */}
            {j.checklist && Object.values(j.checklist).some(Boolean) && (
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <CheckSquare size={16} />
                  Checklist Completed
                </h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {Object.entries(j.checklist)
                    .filter(([, value]) => value)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      >
                        ✓ {key}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Screenshots Section - Responsive Grid */}
            {screenshots.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Camera size={16} />
                  Screenshots ({screenshots.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {screenshots.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(url)}
                      className="block group relative aspect-video rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                      <img
                        src={url}
                        alt={`Trade screenshot ${i + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={selectedImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareTradeModal
          trade={trade}
          username={username}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}

/* =====================
   LOADING STATE COMPONENT
===================== */

function LoadingState() {
  const loadingTips = [
    "Analyzing your trade data...",
    "Calculating P&L metrics...",
    "Loading journal entries...",
    "Preparing screenshots...",
    "Crunching the numbers...",
    "Almost there...",
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Mobile Skeleton Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="w-24 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Desktop Navigation Skeleton */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="w-24 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </div>

        {/* Main Loading Card */}
        <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Animated Header */}
          <div className="relative p-4 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 animate-gradient-x"></div>
            
            {/* Mobile Header Skeleton */}
            <div className="lg:hidden space-y-3 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-20 h-7 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    <div className="w-12 h-5 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-32 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right space-y-1">
                    <div className="w-12 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse ml-auto"></div>
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  </div>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Desktop Header Skeleton */}
            <div className="hidden lg:flex lg:justify-between relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-32 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="w-16 h-7 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                </div>
                <div className="w-48 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right space-y-1">
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse ml-auto"></div>
                  <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-3 sm:mb-4"></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 sm:p-4">
                  <div className="w-10 h-2.5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="w-14 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Journal Section Skeleton */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-3 sm:mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="w-20 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="w-3/4 h-2.5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="w-1/2 h-2.5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Progress & Tips - Mobile Optimized */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md mx-auto text-center space-y-4">
              {/* Animated Icons - Hidden on mobile, shown on desktop */}
              <div className="hidden sm:flex justify-center gap-3 mb-4">
                {[BarChart3, LineChart, CandlestickChart, Activity].map((Icon, i) => (
                  <div key={i} className="relative">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>
                      <Icon className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile-friendly progress indicator */}
              <div className="flex sm:hidden justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Loading trade data</span>
                  <span className="text-gray-900 dark:text-white font-medium">{Math.min(progress, 95).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 95)}%` }}
                  ></div>
                </div>
              </div>

              {/* Rotating Tips */}
              <div className="relative h-10 sm:h-12 overflow-hidden">
                <div 
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                  style={{ transform: `translateY(-${currentTipIndex * 2.5}rem)` }}
                >
                  {loadingTips.map((tip, index) => (
                    <div 
                      key={index}
                      className="h-10 sm:h-12 flex items-center justify-center text-gray-600 dark:text-gray-400 px-2"
                    >
                      <span className="text-xs sm:text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 1s ease infinite;
        }
      `}</style>
    </div>
  );
}

/* =====================
   UI COMPONENTS
===================== */

interface StatProps {
  label: string;
  value: any;
  tooltip?: string;
  compact?: boolean;
}

function Stat({ label, value, tooltip, compact }: StatProps) {
  return (
    <div 
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 hover:shadow-md transition-shadow cursor-help"
      title={tooltip}
    >
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
        {value}
      </p>
    </div>
  );
}

interface JournalCardProps {
  title: string;
  icon: string;
  children: string;
}

function JournalCard({ title, icon, children }: JournalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = children.length > 150;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 hover:shadow-md transition-shadow">
      <h4 className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h4>
      <div>
        <p className={`text-sm leading-relaxed text-gray-900 dark:text-gray-300 whitespace-pre-wrap ${
          !expanded && isLong ? 'line-clamp-3' : ''
        }`}>
          {children}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
}