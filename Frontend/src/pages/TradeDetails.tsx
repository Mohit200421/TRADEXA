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
  Activity
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

  if (loading) {
    return <LoadingState />;
  }

  if (!trade) {
    return (
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trade not found</h2>
          <button
            onClick={() => navigate("/trades")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Back to Trades
          </button>
        </div>
      </div>
    );
  }

  const j = trade.journal || {};
  const screenshots: string[] = j.screenshots || [];
  const isProfit = trade.pnl >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-4 py-6">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/trades")}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors group"
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
      <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header Section with Gradient Background */}
        <div className={`relative p-6 ${
          isProfit 
            ? 'bg-gradient-to-r from-blue-500/10 via-transparent to-transparent' 
            : 'bg-gradient-to-r from-red-500/10 via-transparent to-transparent'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        {/* Stats Grid */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Trade Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Stat 
              label="Entry" 
              value={formatCurrency(trade.entryPrice)} 
              tooltip="Entry price"
            />
            <Stat 
              label="Exit" 
              value={trade.exitPrice ? formatCurrency(trade.exitPrice) : "-"} 
              tooltip="Exit price"
            />
            <Stat 
              label="Lot Size" 
              value={trade.lotSize} 
              tooltip="Number of lots/shares"
            />
            <Stat 
              label="Type" 
              value={trade.type.toUpperCase()} 
              tooltip="Trade direction"
            />
            <Stat 
              label="Rating" 
              value={j.rating ? `${j.rating}/10` : "-"} 
              tooltip="Self-assessment rating"
            />
            <Stat 
              label="Risk/Reward" 
              value={j.rating ? `${(j.rating / 5).toFixed(1)}` : "-"} 
              tooltip="Estimated risk/reward ratio"
            />
          </div>
        </div>

        {/* Journal Section */}
        {(j.preTrade || j.postTrade || j.emotions || j.lessons) && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Journal Entries</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Tag size={16} />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {j.tags.split(",").map((t: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-default"
                >
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Checklist Section */}
        {j.checklist && Object.values(j.checklist).some(Boolean) && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <CheckSquare size={16} />
              Checklist Completed
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(j.checklist)
                .filter(([, value]) => value)
                .map(([key]) => (
                  <span
                    key={key}
                    className="px-3 py-1.5 rounded-full text-xs bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  >
                    ✓ {key}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Screenshots Section */}
        {screenshots.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <Camera size={16} />
              Screenshots ({screenshots.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 aspect-video">
                    <img
                      src={url}
                      alt={`Trade screenshot ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareTradeModal
          trade={trade}
          username={username}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}

/* =====================
   LOADING STATE COMPONENT
===================== */

function LoadingState() {
  // Array of loading tips to rotate through
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

  // Rotate through tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, []);

  // Simulate progress (optional, for visual effect)
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
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {/* Skeleton Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="w-24 h-9 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
      </div>

      {/* Main Loading Card */}
      <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Animated Header */}
        <div className="relative p-8 overflow-hidden">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 animate-gradient-x"></div>
          
          {/* Animated Chart Lines */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0,50 Q100,30 200,70 T400,40 T600,80 T800,30 T1000,60"
                stroke="currentColor"
                fill="none"
                className="text-blue-500 animate-draw"
                strokeWidth="2"
              />
              <path
                d="M0,70 Q150,90 300,50 T500,80 T700,40 T900,70 T1100,50"
                stroke="currentColor"
                fill="none"
                className="text-purple-500 animate-draw-delayed"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {/* Animated Symbol Skeleton */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
                    <div className="w-16 h-6 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  <div className="w-40 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right space-y-2">
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse ml-auto"></div>
                  <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Stats Grid */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                <div className="w-12 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated Journal Section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Progress & Tips */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md mx-auto text-center space-y-4">
            {/* Animated Icons */}
            <div className="flex justify-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0ms' }}>
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '150ms' }}>
                  <LineChart className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '300ms' }}>
                  <CandlestickChart className="w-6 h-6 text-pink-500" />
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '450ms' }}>
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Loading trade data</span>
                <span className="text-gray-900 dark:text-white font-medium">{Math.min(progress, 95).toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 95)}%` }}
                ></div>
              </div>
            </div>

            {/* Rotating Tips */}
            <div className="relative h-12 overflow-hidden">
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
                style={{ transform: `translateY(-${currentTipIndex * 3}rem)` }}
              >
                {loadingTips.map((tip, index) => (
                  <div 
                    key={index}
                    className="h-12 flex items-center justify-center text-gray-600 dark:text-gray-400"
                  >
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading Spinner */}
            <div className="flex justify-center mt-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes draw {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s ease-in-out infinite;
        }
        .animate-draw-delayed {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2.5s ease-in-out infinite;
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
}

function Stat({ label, value, tooltip }: StatProps) {
  return (
    <div 
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4"
      title={tooltip}
    >
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">
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
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 hover:shadow-md transition-shadow">
      <h4 className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h4>
      <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-300 whitespace-pre-wrap">
        {children}
      </p>
    </div>
  );
}