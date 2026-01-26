import { useMemo } from "react";

export default function ReviewCalendar({
  markedDates,
  selectedDate,
  onSelectDate,
}: any) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // current month

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const totalDays = lastDay.getDate();
    const startWeekDay = firstDay.getDay(); // 0 Sunday

    const arr: any[] = [];

    // empty slots
    for (let i = 0; i < startWeekDay; i++) arr.push(null);

    // actual days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = new Date(year, month, d).toISOString().slice(0, 10);
      arr.push(dateStr);
    }

    return arr;
  }, [year, month]);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">
        Calendar ({today.toLocaleString("default", { month: "long" })} {year})
      </h2>

      <div className="grid grid-cols-7 gap-2 text-center text-sm">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d} className="font-bold text-gray-500">
            {d}
          </div>
        ))}

        {days.map((dateStr, idx) => {
          if (!dateStr) return <div key={idx} />;

          const marked = markedDates.includes(dateStr);
          const selected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`p-2 rounded border text-xs ${
                selected ? "bg-black text-white" : ""
              } ${marked && !selected ? "bg-green-100 border-green-400" : ""}`}
            >
              {dateStr.slice(8, 10)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
