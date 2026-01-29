import { BookOpen } from "lucide-react";
import { useState } from "react";

export default function Journal() {
  const [activeTab, setActiveTab] = useState<"all" | "journaled" | "pending">(
    "all"
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* =====================
          LEFT: JOURNAL LIST
      ===================== */}
      <div className="card p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Trade Journal</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            0 entries
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton
            label="All"
            count={0}
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          />
          <TabButton
            label="Journaled"
            count={0}
            active={activeTab === "journaled"}
            onClick={() => setActiveTab("journaled")}
          />
          <TabButton
            label="Pending"
            count={0}
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            highlight="warning"
          />
        </div>

        {/* Empty list */}
        <div className="flex items-center justify-center h-[420px] text-sm text-text-secondary">
          No trades yet
        </div>
      </div>

      {/* =====================
          RIGHT: JOURNAL DETAIL
      ===================== */}
      <div className="xl:col-span-2 card p-8 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen size={32} className="text-primary" />
          </div>

          <h3 className="text-lg font-semibold">
            Select a trade to journal
          </h3>

          <p className="text-sm text-text-secondary leading-relaxed">
            Click on any trade from the list to view and edit your detailed
            notes, screenshots, and trading insights.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =====================
   SMALL COMPONENTS
===================== */

function TabButton({
  label,
  count,
  active,
  onClick,
  highlight
}: {
  label: string;
  count: number;
  active?: boolean;
  highlight?: "warning";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition
        ${
          active
            ? "bg-primary/20 text-primary"
            : "hover:bg-border-light"
        }
      `}
    >
      {label}
      <span
        className={`text-xs px-2 py-0.5 rounded-full
          ${
            highlight === "warning"
              ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              : "bg-border-light text-text-secondary"
          }
        `}
      >
        {count}
      </span>
    </button>
  );
}
