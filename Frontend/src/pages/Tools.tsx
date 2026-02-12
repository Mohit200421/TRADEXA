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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 
                        dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Trading Tools
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Professional calculators and utilities
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <StatBox value="3" label="Available" />
          <StatBox value="5" label="Coming Soon" />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <ToolCard
          icon={<Calculator className="w-5 h-5" />}
          title="Position Size Calculator"
          description="Calculate optimal lot size"
          badge="POPULAR"
          active
          onClick={() => navigate("/tools/position-size-calculator")}
        />

        <ToolCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Profit Calculator"
          description="Calculate profit and loss"
          active
          onClick={() => navigate("/tools/profit-calculator")}
        />

        <ToolCard
          icon={<Clock className="w-5 h-5" />}
          title="Forex Sessions"
          description="Live market session tracker"
          active
          onClick={() => navigate("/tools/forex-sessions")}
        />

        <ToolCard
          icon={<Brain className="w-5 h-5" />}
          title="AI Report & Analyser"
          description="AI-powered trading analysis"
          comingSoon
        />

        <ToolCard
          icon={<Sun className="w-5 h-5" />}
          title="Demo Trading"
          description="Practice with virtual funds"
          comingSoon
        />

        <ToolCard
          icon={<Target className="w-5 h-5" />}
          title="Risk Calculator"
          description="Risk-reward calculations"
          comingSoon
        />
      </div>

      {/* UPCOMING */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Upcoming Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ComingSoonCard
            icon={<Zap className="w-4 h-4" />}
            title="Backtesting Engine"
            description="Test strategies with historical data"
          />
          <ComingSoonCard
            icon={<Brain className="w-4 h-4" />}
            title="Sentiment Analyzer"
            description="Market sentiment tracking"
          />
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-center">
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        {value}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </p>
    </div>
  );
}

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
        p-5 transition-all duration-200 flex flex-col
        ${active ? "cursor-pointer hover:shadow-lg hover:border-blue-400" : ""}
        ${comingSoon ? "opacity-70" : ""}
      `}
    >
      <div className="flex justify-between mb-4">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          {icon}
        </div>

        {badge && (
          <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
            {badge}
          </span>
        )}

        {comingSoon && (
          <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
            COMING SOON
          </span>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex-1">
        {description}
      </p>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        {active ? (
          <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
            Open Tool
            <ArrowRight className="w-3 h-3" />
          </span>
        ) : (
          <span className="text-xs text-gray-500">
            In Development
          </span>
        )}
      </div>
    </div>
  );
}

function ComingSoonCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
