import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
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
  checklist: Record<string, boolean>;
}

/* =====================
   PAGE
===================== */

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    API.get("/trades")
      .then((res) => setTrades(res.data))
      .catch(() => toast.error("Failed to load trades"));
  }, []);

  const journaled = useMemo(() => trades.filter((t) => t.journal), [trades]);
  const pending = useMemo(() => trades.filter((t) => !t.journal), [trades]);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* SIDEBAR */}
      <aside className="col-span-12 xl:col-span-4 bg-background border border-border rounded-2xl p-4 space-y-6">
        <h2 className="text-lg font-semibold">Journal</h2>

        <div className="space-y-4">
          <TradeSection
            title="Pending"
            icon={<Clock size={16} />}
            trades={pending}
            selected={selectedTrade}
            onSelect={setSelectedTrade}
          />

          <TradeSection
            title="Journaled"
            icon={<CheckCircle size={16} />}
            trades={journaled}
            selected={selectedTrade}
            onSelect={setSelectedTrade}
          />
        </div>
      </aside>

      {/* CONTENT */}
      <main className="col-span-12 xl:col-span-8 bg-background border border-border rounded-2xl">
        {!selectedTrade ? (
          <EmptyState />
        ) : (
          <JournalEditor key={selectedTrade._id} trade={selectedTrade} />
        )}
      </main>
    </div>
  );
}

/* =====================
   JOURNAL EDITOR
===================== */

function JournalEditor({ trade }: { trade: Trade }) {
  const defaultChecklist = {
    "Followed plan": false,
    "Proper risk": false,
    "Good entry": false,
    "Patient exit": false,
  };

  const emptyJournal: Journal = {
    preTrade: "",
    postTrade: "",
    emotions: "",
    lessons: "",
    tags: "",
    rating: 5,
    checklist: defaultChecklist,
  };

  const [form, setForm] = useState<Journal>(emptyJournal);
  const [adding, setAdding] = useState(false);
  const [newPoint, setNewPoint] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(trade.journal ? trade.journal : emptyJournal);
    setAdding(false);
    setNewPoint("");
  }, [trade._id]);

  const addCheckpoint = () => {
    const key = newPoint.trim();
    if (!key) return;

    if (form.checklist[key]) {
      toast.error("Checkpoint already exists");
      return;
    }

    setForm({
      ...form,
      checklist: { ...form.checklist, [key]: false },
    });

    setNewPoint("");
    setAdding(false);
  };

  const saveJournal = async () => {
    const id = toast.loading("Saving journal...");
    try {
      await API.put(`/trades/${trade._id}/journal`, {
        ...form,
      });
      toast.success("Journal saved", { id });
    } catch {
      toast.error("Save failed", { id });
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{trade.symbol}</h1>
          <p className="text-sm text-text-secondary">
            {trade.type} • Entry {trade.entryPrice} • Lot {trade.lotSize}
          </p>
        </div>

        <button
          onClick={saveJournal}
          disabled={saving}
          className="btn-primary"
        >
          Save Journal
        </button>
      </div>

      {/* CHECKLIST */}
      <Card title="Checklist">
        <div className="flex flex-wrap gap-3">
          {Object.entries(form.checklist).map(([key, value]) => (
            <button
              key={key}
              onClick={() =>
                setForm({
                  ...form,
                  checklist: {
                    ...form.checklist,
                    [key]: !value,
                  },
                })
              }
              className={`px-4 py-2 rounded-full border text-sm transition
                ${
                  value
                    ? "bg-primary/10 text-primary border-primary"
                    : "border-border text-text-secondary"
                }`}
            >
              {key}
            </button>
          ))}

          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="px-4 py-2 rounded-full border border-dashed text-sm text-text-secondary hover:text-primary"
            >
              + Add checkpoint
            </button>
          )}
        </div>

        {adding && (
          <div className="mt-4 flex gap-2">
            <input
              autoFocus
              value={newPoint}
              onChange={(e) => setNewPoint(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCheckpoint()}
              placeholder="Custom checkpoint"
              className="input flex-1"
            />
            <button className="btn-primary" onClick={addCheckpoint}>
              Add
            </button>
            <button
              className="btn-secondary"
              onClick={() => setAdding(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </Card>

      {/* NOTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Pre-Trade Plan">
          <Textarea
            value={form.preTrade}
            onChange={(v) => setForm({ ...form, preTrade: v })}
          />
        </Card>

        <Card title="Post-Trade Review">
          <Textarea
            value={form.postTrade}
            onChange={(v) => setForm({ ...form, postTrade: v })}
          />
        </Card>

        <Card title="Emotions">
          <Textarea
            value={form.emotions}
            onChange={(v) => setForm({ ...form, emotions: v })}
          />
        </Card>

        <Card title="Lessons Learned">
          <Textarea
            value={form.lessons}
            onChange={(v) => setForm({ ...form, lessons: v })}
          />
        </Card>
      </div>

      {/* META */}
      <Card title="Meta">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs text-text-secondary">Tags</label>
            <input
              className="input mt-1"
              value={form.tags}
              onChange={(e) =>
                setForm({ ...form, tags: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary">
              Rating
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={form.rating}
              onChange={(e) =>
                setForm({ ...form, rating: Number(e.target.value) })
              }
            />
            <p className="text-right text-sm">{form.rating}/10</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* =====================
   UI HELPERS
===================== */

function TradeSection({
  title,
  icon,
  trades,
  selected,
  onSelect,
}: any) {
  if (trades.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs uppercase text-text-secondary mb-2 flex items-center gap-2">
        {icon}
        {title}
      </h4>

      <div className="space-y-2">
        {trades.map((t: Trade) => (
          <button
            key={t._id}
            onClick={() => onSelect({ ...t })}
            className={`w-full text-left p-3 rounded-xl border transition
              ${
                selected?._id === t._id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-border-light"
              }`}
          >
            <div className="flex justify-between">
              <span className="font-medium">{t.symbol}</span>
              <span
                className={`text-sm ${
                  t.pnl >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {t.pnl}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {new Date(t.entryDate).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({ title, children }: any) {
  return (
    <div className="border border-border rounded-2xl p-5 space-y-3">
      <h3 className="text-sm font-semibold uppercase text-text-secondary">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Textarea({ value, onChange }: any) {
  return (
    <textarea
      rows={4}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-border rounded-xl p-3 resize-none"
    />
  );
}

function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <BookOpen size={40} className="mx-auto text-text-secondary" />
        <p className="text-text-secondary">
          Select a trade to start journaling
        </p>
      </div>
    </div>
  );
}
