import {
  Wrench,
  Calculator,
  Brain,
  Sun,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Tools() {
  const navigate = useNavigate();

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Wrench size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">Trading Tools</h1>
            <p className="text-sm text-text-secondary">
              Professional calculators and utilities to enhance your trading workflow
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <StatBox value="2" label="AVAILABLE" />
          <StatBox value="5" label="COMING SOON" />
        </div>
      </div>

      <hr className="border-border mb-8" />

      {/* ================= TOOLS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* ================= POSITION SIZE ================= */}
        <ToolCard
          icon={<Calculator size={22} />}
          title="Position Size Calculator"
          description="Calculate optimal lot size based on your risk tolerance and stop-loss distance"
          badge="POPULAR"
          active
          onClick={() => navigate("/tools/position-size-calculator")}
        />

        {/* ================= PROFIT CALCULATOR ================= */}
        <ToolCard
          icon={<TrendingUp size={22} />}
          title="Profit Calculator"
          description="Calculate profit or loss using entry price, exit price, and lot size"
          active
          onClick={() => navigate("/tools/profit-calculator")}
        />

        {/* ================= COMING SOON ================= */}
        <ToolCard
          icon={<Brain size={22} />}
          title="AI Report & Analyser"
          description="Get AI-powered analysis and detailed reports on your trading performance"
          comingSoon
        />

        <ToolCard
          icon={<Sun size={22} />}
          title="Demo Trading"
          description="Practice trading strategies risk-free with virtual funds"
          comingSoon
        />
      </div>
    </>
  );
}

/* ================= SMALL COMPONENTS ================= */

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="card px-6 py-4 text-center min-w-[120px]">
      <p className="text-2xl font-semibold text-primary">{value}</p>
      <p className="text-xs text-text-secondary tracking-wide">{label}</p>
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
      className={`card p-6 flex flex-col justify-between transition
        ${active ? "cursor-pointer hover:shadow-lg" : "cursor-default"}
      `}
    >
      <div>
        {/* Icon + Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-border-light">
            {icon}
          </div>

          {badge && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {badge}
            </span>
          )}

          {comingSoon && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-border-light text-text-secondary">
              COMING SOON
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className={`text-lg font-semibold ${comingSoon && "opacity-60"}`}>
          {title}
        </h3>

        <p
          className={`text-sm mt-2 ${
            comingSoon ? "opacity-50" : "text-text-secondary"
          }`}
        >
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        {active ? (
          <span className="flex items-center gap-2 text-sm font-medium text-primary">
            Open Tool →
          </span>
        ) : (
          <span className="text-xs text-text-secondary flex items-center gap-2">
            ● In Development
          </span>
        )}
      </div>
    </div>
  );
}
