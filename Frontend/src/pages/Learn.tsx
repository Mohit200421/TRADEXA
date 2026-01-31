import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  BookOpen
} from "lucide-react";

/* =====================
   TYPES
===================== */

type TopicKey =
  | "basics"
  | "technical"
  | "risk"
  | "psychology"
  | "strategy";

interface Lesson {
  id: string;
  title: string;
  content: string[];
}

/* =====================
   COURSE DATA
===================== */

const course: Record<TopicKey, Lesson[]> = {
  basics: [
    {
      id: "pairs",
      title: "Currency Pairs",
      content: [
        "Forex is traded in pairs like EUR/USD.",
        "Base vs quote currency.",
        "Majors, minors & exotics."
      ]
    },
    {
      id: "pips",
      title: "Pips & Lots",
      content: [
        "Pip is the smallest price move.",
        "Lot size controls exposure."
      ]
    }
  ],
  technical: [
    {
      id: "structure",
      title: "Market Structure",
      content: [
        "HH/HL = uptrend.",
        "LH/LL = downtrend."
      ]
    }
  ],
  risk: [
    {
      id: "risk",
      title: "Risk Per Trade",
      content: [
        "Risk only 1–2%.",
        "Capital preservation first."
      ]
    }
  ],
  psychology: [
    {
      id: "emotions",
      title: "Trading Psychology",
      content: [
        "Fear & greed kill consistency.",
        "Rules > emotions."
      ]
    }
  ],
  strategy: [
    {
      id: "breakout",
      title: "Breakout Strategy",
      content: [
        "Trade expansion after range.",
        "Avoid fake breakouts."
      ]
    }
  ]
};

/* =====================
   PAGE
===================== */

export default function Learn() {
  const [topic, setTopic] = useState<TopicKey>("basics");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("learn-progress");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const lessons = course[topic];
  const lesson = lessons[lessonIndex];

  const totalLessons = Object.values(course).flat().length;

  const progress = useMemo(() => {
    return Math.round((completed.length / totalLessons) * 100);
  }, [completed, totalLessons]);

  const topicProgress = useMemo(() => {
    const ids = course[topic].map(l => l.id);
    const done = completed.filter(id => ids.includes(id)).length;
    return Math.round((done / ids.length) * 100);
  }, [completed, topic]);

  const markCompleted = () => {
    if (completed.includes(lesson.id)) return;
    const updated = [...completed, lesson.id];
    setCompleted(updated);
    localStorage.setItem("learn-progress", JSON.stringify(updated));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* LEFT */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Forex Academy</h3>

        <ProgressBar label="Overall Progress" value={progress} />

        <TopicBtn label="Basics" onClick={() => setTopic("basics")} />
        <TopicBtn label="Technical" onClick={() => setTopic("technical")} />
        <TopicBtn label="Risk" onClick={() => setTopic("risk")} />
        <TopicBtn label="Psychology" onClick={() => setTopic("psychology")} />
        <TopicBtn label="Strategy" onClick={() => setTopic("strategy")} />
      </div>

      {/* RIGHT */}
      <div className="xl:col-span-3 card p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <span className="text-sm text-text-secondary">
            Topic Progress: {topicProgress}%
          </span>
        </div>

        <div className="space-y-3 text-sm">
          {lesson.content.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <button
            onClick={() => setLessonIndex(Math.max(0, lessonIndex - 1))}
            className="btn-secondary"
          >
            Previous
          </button>

          <button
            onClick={markCompleted}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              ${
                completed.includes(lesson.id)
                  ? "bg-green-100 text-green-700"
                  : "bg-primary text-white"
              }
            `}
          >
            <CheckCircle size={16} />
            {completed.includes(lesson.id)
              ? "Completed"
              : "Mark Complete"}
          </button>

          <button
            onClick={() =>
              setLessonIndex(
                Math.min(lessons.length - 1, lessonIndex + 1)
              )
            }
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================
   UI HELPERS
===================== */

function TopicBtn({
  label,
  onClick
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-border-light"
    >
      {label}
    </button>
  );
}

function ProgressBar({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded bg-border-light overflow-hidden">
        <div
          className="h-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
