import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom"; // ✅ ADD THIS

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import {
  getAnalyticsSummary,
  getEquityCurve,
  getMonthlyAnalytics,
  getAdvancedAnalytics,
} from "../services/tradeService";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [curve, setCurve] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [advanced, setAdvanced] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalyticsSummary();
      setData(res.data);

      const curveRes = await getEquityCurve();
      setCurve(curveRes.data);

      const monthlyRes = await getMonthlyAnalytics();
      setMonthly(monthlyRes.data);

      const advRes = await getAdvancedAnalytics();
      setAdvanced(advRes.data);
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
      {/* Header + Bar Replay Link */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

        {/* ✅ Bar Replay Link */}
        <Link
          to="/replay"
          className="text-blue-600 underline font-medium"
        >
          Bar Replay
        </Link>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card title="Total Trades" value={data.totalTrades} />
          <Card title="Wins" value={data.wins} />
          <Card title="Losses" value={data.losses} />
          <Card
            title="Win Rate"
            value={`${Number(data.winRate || 0).toFixed(2)}%`}
          />
          <Card
            title="Total PnL"
            value={Number(data.totalPnL || 0).toFixed(2)}
          />
          <Card title="Avg Win" value={Number(data.avgWin || 0).toFixed(2)} />
          <Card title="Avg Loss" value={Number(data.avgLoss || 0).toFixed(2)} />
        </div>
      )}

      {/* Equity Curve */}
      <div className="bg-white p-4 rounded-xl shadow mt-6">
        <h2 className="text-lg font-semibold mb-3">Equity Curve</h2>

        {curve.length === 0 ? (
          <p className="text-gray-500 text-sm">No data yet. Add trades ✅</p>
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

      {/* Monthly Performance */}
      <div className="bg-white p-4 rounded-xl shadow mt-6">
        <h2 className="text-lg font-semibold mb-3">Monthly Performance</h2>

        {monthly.length === 0 ? (
          <p className="text-gray-500 text-sm">No monthly data yet.</p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pnl" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Win vs Loss Pie */}
      {data && (
        <div className="bg-white p-4 rounded-xl shadow mt-6">
          <h2 className="text-lg font-semibold mb-3">Win vs Loss</h2>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: "Wins", value: data.wins || 0 },
                    { name: "Losses", value: data.losses || 0 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Advanced Analytics */}
      {advanced && (
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Max Drawdown</h2>
            <p className="text-2xl font-bold">
              {Number(advanced.maxDrawdown || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Top Symbols</h2>
            {advanced.bestSymbols?.length > 0 ? (
              advanced.bestSymbols.map((s: any) => (
                <p key={s.symbol} className="text-sm">
                  {s.symbol} → <b>{Number(s.pnl || 0).toFixed(2)}</b> ({s.trades})
                </p>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No symbol data</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Top Setups</h2>
            {advanced.bestSetups?.length > 0 ? (
              advanced.bestSetups.map((s: any) => (
                <p key={s.setup} className="text-sm">
                  {s.setup} → <b>{Number(s.pnl || 0).toFixed(2)}</b> ({s.trades})
                </p>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No setup data</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}
