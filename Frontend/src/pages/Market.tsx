import {
  Calendar,
  Search,
  RefreshCcw,
  ChevronDown
} from "lucide-react";

export default function Market() {
  return (
    <>
      {/* ================= PAGE HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Market</h1>
        <p className="text-sm text-text-secondary">Thu, Jan 29</p>
      </div>

      {/* ================= ECONOMIC CALENDAR CARD ================= */}
      <div className="card p-6">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Economic Calendar</h2>
            <p className="text-sm text-text-secondary">
              Track high-impact economic events and news that move the markets
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded bg-border-light">GMT+5:30</span>
            <span className="px-3 py-1 rounded bg-red-100 text-red-600">
              ● ERROR
            </span>
            <span className="text-text-secondary">
              Updated 8:28:44 PM
            </span>
          </div>
        </div>


        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Day filters */}
          <div className="flex gap-2">
            <Filter active>Today</Filter>
            <Filter locked>Tomorrow</Filter>
            <Filter locked>This Week</Filter>
            <Filter locked>All</Filter>
          </div>

          {/* Impact filters */}
          <div className="flex gap-2">
            <Impact label="High" color="red" active />
            <Impact label="Med" color="yellow" active />
            <Impact label="Low" color="green" locked />
          </div>

          {/* Country */}
          <Filter locked>US Only</Filter>

          {/* Search */}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                placeholder="Search events..."
                className="pl-9 pr-3 py-2 rounded-lg bg-border-light text-sm outline-none"
              />
            </div>
            <button className="p-2 rounded-lg bg-border-light">
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-4">7 events</p>
      </div>

      {/* ================= EVENTS ================= */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Today</h3>
          <span className="text-sm text-text-secondary">7 events</span>
        </div>

        <div className="space-y-3">
          <Event
            time="12:30 AM"
            impact="HIGH"
            title="Fed Interest Rate Decision"
            forecast="3.75%"
            previous="3.75%"
          />
          <Event
            time="01:00 AM"
            impact="HIGH"
            title="Fed Press Conference"
            forecast="—"
            previous="—"
          />
          <Event
            time="07:00 PM"
            impact="MED"
            title="Initial Jobless Claims"
            forecast="205K"
            previous="200K"
          />
        </div>
      </div>
    </>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Filter({
  children,
  active,
  locked
}: {
  children: string;
  active?: boolean;
  locked?: boolean;
}) {
  return (
    <button
      className={`px-3 py-1.5 rounded-lg text-sm border
        ${
          active
            ? "bg-primary/20 text-primary border-primary/30"
            : "bg-border-light border-border"
        }
        ${locked && "opacity-50 cursor-not-allowed"}
      `}
    >
      {children}
    </button>
  );
}

function Impact({
  label,
  color,
  active,
  locked
}: {
  label: string;
  color: "red" | "yellow" | "green";
  active?: boolean;
  locked?: boolean;
}) {
  const dot = {
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    green: "bg-green-400"
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
        ${active ? "bg-primary/10" : "bg-border-light"}
        ${locked && "opacity-50"}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${dot[color]}`} />
      {label}
    </div>
  );
}

function Event({
  time,
  impact,
  title,
  forecast,
  previous
}: {
  time: string;
  impact: "HIGH" | "MED";
  title: string;
  forecast: string;
  previous: string;
}) {
  return (
    <div className="card px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="w-20 text-text-secondary">{time}</span>
        <span className="px-2 py-0.5 rounded text-xs bg-border-light">
          US
        </span>
        <span className="px-2 py-0.5 rounded text-xs bg-border-light">
          USD
        </span>
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            impact === "HIGH"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {impact}
        </span>
        <span className="font-medium">{title}</span>
      </div>

      <div className="flex items-center gap-10 text-sm text-text-secondary">
        <div>
          <p className="text-xs">ACTUAL</p>
          <p>—</p>
        </div>
        <div>
          <p className="text-xs">FORECAST</p>
          <p>{forecast}</p>
        </div>
        <div>
          <p className="text-xs">PREVIOUS</p>
          <p>{previous}</p>
        </div>
        <ChevronDown size={18} />
      </div>
    </div>
  );
}
