import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAnalyticsSummary } from "../services/tradeService";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalyticsSummary();
      setData(res.data);
    } catch {
      toast.error("Failed to load analytics ❌");
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card title="Total Trades" value={data.totalTrades} />
        <Card title="Wins" value={data.wins} />
        <Card title="Losses" value={data.losses} />
        <Card title="Win Rate" value={`${data.winRate.toFixed(2)}%`} />
        <Card title="Total PnL" value={data.totalPnL.toFixed(2)} />
        <Card title="Avg Win" value={data.avgWin.toFixed(2)} />
        <Card title="Avg Loss" value={data.avgLoss.toFixed(2)} />
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
