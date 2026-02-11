import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import toast from "react-hot-toast";

export default function TradeDetails() {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<any>(null);

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        const res = await API.get("/trades");
        const found = res.data.find((t: any) => t._id === tradeId);

        if (!found) {
          toast.error("Trade not found");
          navigate("/trades");
          return;
        }

        setTrade(found);
      } catch {
        toast.error("Failed to load trade");
      }
    };

    fetchTrade();
  }, [tradeId, navigate]);

  if (!trade) return null;

  const j = trade.journal || {};
  const screenshots: string[] = j.screenshots || [];
  const isProfit = trade.pnl >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-2 sm:px-4">
      {/* BACK */}
      <button
        onClick={() => navigate("/trades")}
        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Trades
      </button>

      {/* HEADER */}
      <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {trade.symbol}
          </h1>

          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium
              ${
                isProfit
                  ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  : "bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400"
              }`}
          >
            {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {isProfit ? "PROFIT" : "LOSS"}
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Stat label="Type" value={trade.type} />
          <Stat label="Entry" value={trade.entryPrice} />
          <Stat label="Exit" value={trade.exitPrice ?? "-"} />
          <Stat label="Lot Size" value={trade.lotSize} />
          <Stat
            label="P&L"
            value={trade.pnl}
            highlight
            positive={isProfit}
          />
          <Stat label="Rating" value={j.rating ? `${j.rating}/10` : "-"} />
        </div>

        {/* JOURNAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JournalCard title="Pre-Trade Plan">{j.preTrade}</JournalCard>
          <JournalCard title="Post-Trade Review">{j.postTrade}</JournalCard>
          <JournalCard title="Emotions">{j.emotions}</JournalCard>
          <JournalCard title="Lessons Learned">{j.lessons}</JournalCard>
        </div>

        {/* TAGS */}
        <Section title="Tags">
          {j.tags ? (
            <div className="flex flex-wrap gap-2">
              {j.tags.split(",").map((t: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {t.trim()}
                </span>
              ))}
            </div>
          ) : (
            <Muted>—</Muted>
          )}
        </Section>

        {/* CHECKLIST */}
        <Section title="Checklist">
          <div className="flex flex-wrap gap-2">
            {j.checklist &&
              Object.entries(j.checklist)
                .filter(([, v]) => v)
                .map(([k]) => (
                  <span
                    key={k}
                    className="px-3 py-1 rounded-full text-xs bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  >
                    {k}
                  </span>
                ))}

            {!j.checklist && <Muted>—</Muted>}
          </div>
        </Section>

        {/* SCREENSHOTS */}
        <Section title="Screenshots">
          {screenshots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Trade screenshot ${i + 1}`}
                  loading="lazy"
                  className="rounded-xl border border-gray-200 dark:border-gray-800 object-cover w-full h-40 hover:scale-[1.02] transition"
                />
              ))}
            </div>
          ) : (
            <Muted>No screenshots uploaded</Muted>
          )}
        </Section>
      </div>
    </div>
  );
}

/* =====================
   UI COMPONENTS
===================== */

function Stat({
  label,
  value,
  highlight,
  positive,
}: {
  label: string;
  value: any;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 text-sm">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p
        className={`font-semibold ${
          highlight
            ? positive
              ? "text-blue-600 dark:text-blue-400"
              : "text-red-500 dark:text-red-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function JournalCard({ title, children }: any) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
      <h4 className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </h4>
      <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-300">
        {children || "—"}
      </p>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Muted({ children }: any) {
  return <p className="text-sm text-gray-600 dark:text-gray-400">{children}</p>;
}