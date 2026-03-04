import {
  Calculator,
  TrendingUp,
  Clock,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Tools() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Simulate loading for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // Reduced loading time
    return () => clearTimeout(timer);
  }, []);

  // SIMPLE LOADING UI
  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Tools grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 p-5"
            >
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4" />
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-900 rounded animate-pulse mb-2" />
              <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Simple loading indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <span className="text-sm ml-2">Loading tools...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Trading Tools
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Professional calculators and utilities
          </p>
        </div>

        <div className="flex gap-3">
          <StatBox value="3" label="Available" />
        </div>
      </div>

      {/* GRID - Only Working Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ToolCard
          icon={<Calculator className="w-5 h-5" />}
          title="Position Size Calculator"
          description="Calculate optimal lot size based on risk and account balance"
          badge="POPULAR"
          onClick={() => navigate("/tools/position-size-calculator")}
        />

        <ToolCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Profit Calculator"
          description="Calculate profit and loss for your trades"
          onClick={() => navigate("/tools/profit-calculator")}
        />

        <ToolCard
          icon={<Clock className="w-5 h-5" />}
          title="Forex Sessions"
          description="Live market session tracker with time zone converter"
          onClick={() => navigate("/tools/forex-sessions")}
        />
      </div>

      {/* SIMPLE FOOTER */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        More tools coming soon
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
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 
        p-5 transition-all duration-200 flex flex-col cursor-pointer 
        hover:shadow-lg hover:border-blue-400 hover:scale-[1.02] active:scale-[0.98]"
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
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex-1">
        {description}
      </p>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
          Open Tool
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}