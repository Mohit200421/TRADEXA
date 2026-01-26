import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Replay() {
  const [allCandles, setAllCandles] = useState<any[]>([]);
  const [visible, setVisible] = useState<any[]>([]);
  const [index, setIndex] = useState(30);
  const [playing, setPlaying] = useState(false);

  // ✅ Dummy Candles Generator (for now)
  const generateCandles = () => {
    const data = [];
    let price = 100;

    for (let i = 1; i <= 200; i++) {
      price += Math.random() * 4 - 2; // random move
      data.push({
        time: `C${i}`,
        price: Number(price.toFixed(2)),
      });
    }
    return data;
  };

  useEffect(() => {
    const candles = generateCandles();
    setAllCandles(candles);
    setVisible(candles.slice(0, 30));
  }, []);

  // ✅ Play Mode
  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 800);

    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (allCandles.length > 0 && index < allCandles.length) {
      setVisible(allCandles.slice(0, index));
    }
    if (index >= allCandles.length) {
      setPlaying(false);
      toast.success("Replay Finished ✅");
    }
  }, [index]);

  const handleNext = () => {
    if (index < allCandles.length) setIndex(index + 1);
  };

  const handleReset = () => {
    setIndex(30);
    setVisible(allCandles.slice(0, 30));
    setPlaying(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📈 Bar Replay</h1>

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setPlaying(!playing)}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {playing ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Next Candle
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Reset
          </button>
        </div>

        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <LineChart data={visible}>
              <XAxis dataKey="time" hide />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
