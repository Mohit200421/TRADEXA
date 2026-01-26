import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getReviews, saveReview, getReviewDates } from "../services/reviewService";
import ReviewCalendar from "../components/ReviewCalendar";

export default function Reviews() {
  const [type, setType] = useState("DAILY");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const [list, setList] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  const [form, setForm] = useState({
    summary: "",
    mistakes: "",
    lessons: "",
    plan: "",
    mood: "",
  });

  const fetchReviews = async () => {
    try {
      const res = await getReviews(type);
      setList(res.data);
    } catch {
      toast.error("Failed to load reviews ❌");
    }
  };

  const fetchMarkedDates = async () => {
    try {
      const res = await getReviewDates(type);
      setMarkedDates(res.data.dates || []);
    } catch {
      toast.error("Failed to load calendar ❌");
    }
  };

  const calculateStreak = (dates: string[]) => {
    const set = new Set(dates);
    let count = 0;

    let current = new Date();
    while (true) {
      const d = current.toISOString().slice(0, 10);
      if (set.has(d)) {
        count++;
        current.setDate(current.getDate() - 1);
      } else break;
    }

    return count;
  };

  useEffect(() => {
    fetchReviews();
    fetchMarkedDates();
  }, [type]);

  useEffect(() => {
    setStreak(calculateStreak(markedDates));
  }, [markedDates]);

  const handleSave = async () => {
    try {
      setLoading(true);

      await saveReview({ type, date, ...form });

      toast.success("Review saved ✅");

      // refresh list + calendar
      fetchReviews();
      fetchMarkedDates();

      // clear form
      setForm({
        summary: "",
        mistakes: "",
        lessons: "",
        plan: "",
        mood: "",
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Save failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Review System</h1>

      {/* ✅ Calendar + Streak */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ReviewCalendar
          markedDates={markedDates}
          selectedDate={date}
          onSelectDate={(d: string) => setDate(d)}
        />

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">🔥 Streak</h2>
          <p className="text-3xl font-bold">{streak} days</p>
          <p className="text-sm text-gray-500 mt-2">
            Keep saving reviews daily to build discipline 💪
          </p>
        </div>
      </div>

      {/* Add Review Form */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid gap-3">
        <div className="grid md:grid-cols-3 gap-3">
          <select
            className="border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="DAILY">DAILY</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="MONTHLY">MONTHLY</option>
          </select>

          <input
            type="date"
            className="border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Mood (e.g. Calm, Fear, FOMO)"
            value={form.mood}
            onChange={(e) => setForm({ ...form, mood: e.target.value })}
          />
        </div>

        <textarea
          className="border p-2 rounded"
          placeholder="Summary"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <textarea
          className="border p-2 rounded"
          placeholder="Mistakes"
          value={form.mistakes}
          onChange={(e) => setForm({ ...form, mistakes: e.target.value })}
        />
        <textarea
          className="border p-2 rounded"
          placeholder="Lessons"
          value={form.lessons}
          onChange={(e) => setForm({ ...form, lessons: e.target.value })}
        />
        <textarea
          className="border p-2 rounded"
          placeholder="Plan for next period"
          value={form.plan}
          onChange={(e) => setForm({ ...form, plan: e.target.value })}
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Review"}
        </button>
      </div>

      {/* Reviews List */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">Saved Reviews</h2>

        {list.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {list.map((r) => (
              <div key={r._id} className="border rounded p-3">
                <p className="text-sm text-gray-500">
                  {r.type} • {r.date} • Mood: {r.mood || "-"}
                </p>

                <p className="font-semibold mt-2">Summary:</p>
                <p className="text-sm">{r.summary || "-"}</p>

                {r.mistakes && (
                  <>
                    <p className="font-semibold mt-2">Mistakes:</p>
                    <p className="text-sm">{r.mistakes}</p>
                  </>
                )}

                {r.lessons && (
                  <>
                    <p className="font-semibold mt-2">Lessons:</p>
                    <p className="text-sm">{r.lessons}</p>
                  </>
                )}

                {r.plan && (
                  <>
                    <p className="font-semibold mt-2">Plan:</p>
                    <p className="text-sm">{r.plan}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
