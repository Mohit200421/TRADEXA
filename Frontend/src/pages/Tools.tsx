import {
  Wrench,
  Calculator,
  Brain,
  Sun
} from "lucide-react";

export default function Tools() {
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
          <StatBox value="1" label="AVAILABLE" />
          <StatBox value="5" label="COMING SOON" />
        </div>
      </div>

      <hr className="border-border mb-8" />

      {/* ================= TOOLS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* ================= ACTIVE TOOL ================= */}
        <ToolCard
          icon={<Calculator size={22} />}
          title="Position Size Calculator"
          description="Calculate optimal lot size based on your risk tolerance and stop-loss distance"
          badge="POPULAR"
          active
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
  comingSoon
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  active?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className="card p-6 flex flex-col justify-between">
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

        <p className={`text-sm mt-2 ${comingSoon ? "opacity-50" : "text-text-secondary"}`}>
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        {active ? (
          <button className="flex items-center gap-2 text-sm font-medium text-primary">
            Open Tool →
          </button>
        ) : (
          <span className="text-xs text-text-secondary flex items-center gap-2">
            ● In Development
          </span>
        )}
      </div>
    </div>
  );
}
