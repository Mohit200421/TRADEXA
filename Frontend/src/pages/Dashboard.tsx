import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getAnalyticsSummary, getEquityCurve } from "../services/tradeService";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [curve, setCurve] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalyticsSummary();
      setData(res.data);

      const curveRes = await getEquityCurve();
      setCurve(curveRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load analytics ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card title="Total Trades" value={data.totalTrades} />
          <Card title="Wins" value={data.wins} />
          <Card title="Losses" value={data.losses} />
          <Card title="Win Rate" value={`${Number(data.winRate || 0).toFixed(2)}%`} />
          <Card title="Total PnL" value={Number(data.totalPnL || 0).toFixed(2)} />
          <Card title="Avg Win" value={Number(data.avgWin || 0).toFixed(2)} />
          <Card title="Avg Loss" value={Number(data.avgLoss || 0).toFixed(2)} />
        </div>
      )}

      {/* Equity Curve */}
      <div className="bg-white p-4 rounded-xl shadow mt-6">
        <h2 className="text-lg font-semibold mb-3">Equity Curve</h2>

        {curve.length === 0 ? (
          <p className="text-gray-500 text-sm">No data yet. Add some trades ✅</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={curve}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="equity" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}
