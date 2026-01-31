import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  RotateCcw,
  BarChart3
} from "lucide-react";
import API from "../api/axios";

/* =====================
   TYPES
===================== */

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

interface Journal {
  preTrade: string;
  postTrade: string;
  emotions: string;
  lessons: string;
  tags: string;
  rating: number;
  checklist: {
    followedPlan: boolean;
    properRisk: boolean;
    goodEntry: boolean;
    patientExit: boolean;
  };
}

/* =====================
   MAIN PAGE
===================== */

export default function Journal() {
  const [tab, setTab] = useState<"all" | "journaled" | "pending">("all");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    API.get("/trades").then((res) => setTrades(res.data));
  }, []);

  const journaled = useMemo(
    () => trades.filter((t) => t.journal),
    [trades]
  );

  const pending = useMemo(
    () => trades.filter((t) => !t.journal),
    [trades]
  );

  const visible = useMemo(() => {
    if (tab === "journaled") return journaled;
    if (tab === "pending") return pending;
    return trades;
  }, [tab, trades, journaled, pending]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* =====================
          LEFT PANEL
      ===================== */}
      <div className="rounded-2xl border border-border bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Trade Journal</h2>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
            {visible.length} entries
          </span>
        </div>

        {/* Tabs */}
        <div className="flex bg-border-light rounded-xl p-1 mb-4">
          <Tab label="All" count={trades.length} active={tab === "all"} onClick={() => setTab("all")} />
          <Tab label="Journaled" count={journaled.length} active={tab === "journaled"} onClick={() => setTab("journaled")} />
          <Tab label="Pending" count={pending.length} active={tab === "pending"} onClick={() => setTab("pending")} />
        </div>

        {/* Trades */}
        <div className="space-y-3 max-h-[520px] overflow-y-auto">
          {visible.length === 0 ? (
            <p className="text-sm text-center text-text-secondary py-20">
              No trades yet
            </p>
          ) : (
            visible.map((trade) => (
              <TradeCard
                key={trade._id}
                trade={trade}
                active={selectedTrade?._id === trade._id}
                onClick={() => setSelectedTrade(trade)}
              />
            ))
          )}
        </div>
      </div>

      {/* =====================
          RIGHT PANEL
      ===================== */}
      <div className="xl:col-span-2 rounded-2xl border border-border bg-background">
        {!selectedTrade ? (
          <EmptyState />
        ) : (
          <JournalEditor trade={selectedTrade} />
        )}
      </div>
    </div>
  );
}

/* =====================
   LEFT TRADE CARD
===================== */

function TradeCard({
  trade,
  active,
  onClick
}: {
  trade: Trade;
  active: boolean;
  onClick: () => void;
}) {
  const profit = trade.pnl >= 0;

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-4 border transition-all
        ${
          active
            ? "border-primary bg-primary/10 shadow-sm"
            : "border-border hover:bg-border-light"
        }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-base">{trade.symbol}</h4>
          <span
            className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full
              ${
                trade.type === "LONG"
                  ? "bg-primary/10 text-primary"
                  : "bg-red-500/10 text-red-500"
              }`}
          >
            {trade.type}
          </span>
        </div>

        <div className="text-right">
          <div
            className={`font-semibold ${
              profit ? "text-primary" : "text-red-500"
            }`}
          >
            {profit ? "+" : ""}
            {trade.pnl}
          </div>

          {!trade.journal && (
            <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-border-light text-text-secondary">
              NEW
            </span>
          )}
        </div>
      </div>

      <div className="text-xs text-text-secondary mt-2">
        {new Date(trade.entryDate).toLocaleString()}
      </div>
    </div>
  );
}

/* =====================
   EMPTY STATE
===================== */

function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center p-10">
      <div className="text-center max-w-md space-y-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <BookOpen size={28} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold">
          Select a trade to journal
        </h3>
        <p className="text-sm text-text-secondary">
          Click on any trade from the list to view and edit your detailed notes,
          screenshots, and trading insights.
        </p>
      </div>
    </div>
  );
}

/* =====================
   JOURNAL EDITOR
===================== */

function JournalEditor({ trade }: { trade: Trade }) {
  const [form, setForm] = useState<Journal>({
    preTrade: trade.journal?.preTrade || "",
    postTrade: trade.journal?.postTrade || "",
    emotions: trade.journal?.emotions || "",
    lessons: trade.journal?.lessons || "",
    tags: trade.journal?.tags || "",
    rating: trade.journal?.rating || 5,
    checklist: trade.journal?.checklist || {
      followedPlan: false,
      properRisk: false,
      goodEntry: false,
      patientExit: false
    }
  });

  return (
    <div className="p-6 space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background pb-4 border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {trade.symbol}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  trade.pnl >= 0
                    ? "bg-primary/10 text-primary"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {trade.pnl >= 0 ? "WINNER" : "LOSER"}
              </span>
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {trade.type} • Entry ${trade.entryPrice} • Size {trade.lotSize} •{" "}
              {new Date(trade.entryDate).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2">
            <button className="btn-secondary">
              <RotateCcw size={16} />
            </button>
            <button className="btn-secondary flex gap-2">
              <BarChart3 size={16} />
              Analytics
            </button>
            <button className="btn-primary">Save</button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <Section title="Pre-Trade Analysis">
        <Textarea placeholder="What did you see? Plan, thesis, levels, risk..." />
      </Section>

      <Section title="Post-Trade Review">
        <Textarea placeholder="What happened? Execution, slippage, improvements..." />
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Emotions">
          <Textarea placeholder="Calm, anxious, FOMO, confident..." />
        </Section>
        <Section title="Lessons Learned">
          <Textarea placeholder="Key takeaways to repeat or avoid..." />
        </Section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Tags">
          <input className="input" placeholder="breakout, trend, news" />
        </Section>

        <Section title="Rating">
          <input type="range" min={1} max={10} value={form.rating} className="w-full" />
          <div className="text-right text-sm text-text-secondary">
            {form.rating}/10
          </div>
        </Section>
      </div>

      <Section title="Execution Checklist">
        <div className="flex flex-wrap gap-3">
          {Object.entries(form.checklist).map(([key, value]) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-full text-sm border transition
                ${
                  value
                    ? "bg-primary/10 text-primary border-primary"
                    : "border-border text-text-secondary"
                }`}
            >
              {key.replace(/([A-Z])/g, " $1")}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Screenshots">
        <div className="border-2 border-dashed rounded-2xl p-10 text-center text-text-secondary hover:border-primary transition cursor-pointer">
          Drop chart screenshots here or click to upload
        </div>
      </Section>
    </div>
  );
}

/* =====================
   UI HELPERS
===================== */

function Section({ title, children }: any) {
  return (
    <div className="rounded-2xl border border-border p-5 space-y-3 bg-background">
      <h4 className="text-sm font-semibold text-text-secondary uppercase">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Textarea({ placeholder }: any) {
  return (
    <textarea
      rows={4}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border p-4 resize-none bg-background focus:outline-primary"
    />
  );
}

function Tab({
  label,
  count,
  active,
  onClick
}: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm ${
        active
          ? "bg-background shadow text-primary"
          : "text-text-secondary"
      }`}
    >
      {label}{" "}
      <span className="ml-1 text-xs text-text-secondary">
        {count}
      </span>
    </button>
  );
}
