import {
  Wrench,
  Calculator,
  Brain,
  Sun,
  TrendingUp,
  Target,
  BarChart3,
  Clock,
  Zap,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Tools() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 
                        dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
            <Wrench className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Trading Tools</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Professional calculators and utilities for better trading decisions
            </p>
          </div>
        </div>

        {/* Stats - Mobile Responsive */}
        <div className="flex gap-3">
          <StatBox value="2" label="Available" />
          <StatBox value="5" label="Coming Soon" />
        </div>
      </div>

      {/* ================= TOOLS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* ================= POSITION SIZE ================= */}
        <ToolCard
          icon={<Calculator className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="Position Size Calculator"
          description="Calculate optimal lot size based on risk tolerance and stop-loss"
          badge="POPULAR"
          active
          onClick={() => navigate("/tools/position-size-calculator")}
        />

        {/* ================= PROFIT CALCULATOR ================= */}
        <ToolCard
          icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="Profit Calculator"
          description="Calculate profit/loss using entry, exit prices, and lot size"
          active
          onClick={() => navigate("/tools/profit-calculator")}
        />

        {/* ================= AI REPORT ANALYSER ================= */}
        <ToolCard
          icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="AI Report & Analyser"
          description="AI-powered analysis of your trading performance"
          comingSoon
        />

        {/* ================= DEMO TRADING ================= */}
        <ToolCard
          icon={<Sun className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="Demo Trading"
          description="Practice strategies risk-free with virtual funds"
          comingSoon
        />

        {/* ================= RISK CALCULATOR ================= */}
        <ToolCard
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="Risk Calculator"
          description="Calculate risk-reward ratios and position sizing"
          comingSoon
        />

        {/* ================= TRADE JOURNAL ================= */}
        <ToolCard
          icon={<BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />}
          title="Advanced Trade Journal"
          description="Detailed analytics and performance tracking"
          comingSoon
        />
      </div>

      {/* ================= COMING SOON SECTION ================= */}
      <div className="mt-8 sm:mt-12">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Upcoming Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ComingSoonCard 
            icon={<Clock className="w-4 h-4" />}
            title="Market Scanner"
            description="Real-time market scanning for opportunities"
          />
          <ComingSoonCard 
            icon={<Zap className="w-4 h-4" />}
            title="Backtesting Engine"
            description="Test strategies with historical data"
          />
          <ComingSoonCard 
            icon={<Brain className="w-4 h-4" />}
            title="Sentiment Analyzer"
            description="Market sentiment analysis tool"
          />
        </div>
      </div>
    </div>
  );
}

/* ================= STAT BOX COMPONENT ================= */
function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 min-w-[100px] sm:min-w-[120px] bg-white dark:bg-black 
                  border border-gray-200 dark:border-gray-800 rounded-lg px-3 sm:px-4 py-3 text-center">
      <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

/* ================= TOOL CARD COMPONENT ================= */
function ToolCard({
  icon,
  title,
  description,
  badge,
  active,
  comingSoon,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  active?: boolean;
  comingSoon?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={active ? onClick : undefined}
      className={`bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 
                p-4 sm:p-5 transition-all duration-200 flex flex-col h-full
                ${active ? "cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 dark:hover:shadow-gray-900" : ""}
                ${comingSoon ? "opacity-70" : ""}
      `}
    >
      {/* Icon + Badge Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2.5 rounded-lg ${
          comingSoon 
            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400" 
            : "bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400"
        }`}>
          {icon}
        </div>

        {badge && (
          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium 
                         bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
            {badge}
          </span>
        )}

        {comingSoon && (
          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium 
                         bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            COMING SOON
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
          comingSoon 
            ? "text-gray-500 dark:text-gray-400" 
            : "text-gray-900 dark:text-white"
        }`}>
          {title}
        </h3>

        <p className={`text-xs sm:text-sm ${
          comingSoon 
            ? "text-gray-400 dark:text-gray-500" 
            : "text-gray-600 dark:text-gray-400"
        }`}>
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
        {active ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 group">
              Open Tool
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
              In Development
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Q2 2024</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= COMING SOON CARD ================= */
function ComingSoonCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
                  rounded-lg p-3 sm:p-4 flex items-center gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 dark:bg-gray-800 
                    flex items-center justify-center text-gray-500 dark:text-gray-400">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}