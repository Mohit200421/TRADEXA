import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createTrade, getTrades, deleteTrade } from "../services/tradeService";

export default function Trades() {
  const [trades, setTrades] = useState<any[]>([]);
  const [form, setForm] = useState({
    symbol: "",
    side: "BUY",
    entry: "",
    stopLoss: "",
    takeProfit: "",
    quantity: "1",
    notes: "",
  });

  const fetchTrades = async () => {
    try {
      const res = await getTrades();
      setTrades(res.data);
    } catch (err: any) {
      toast.error("Failed to load trades ❌");
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await createTrade({
        ...form,
        entry: Number(form.entry),
        stopLoss: Number(form.stopLoss),
        takeProfit: Number(form.takeProfit),
        quantity: Number(form.quantity),
      });
      toast.success("Trade Added ✅");
      setForm({
        symbol: "",
        side: "BUY",
        entry: "",
        stopLoss: "",
        takeProfit: "",
        quantity: "1",
        notes: "",
      });
      fetchTrades();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Trade add failed ❌");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTrade(id);
      toast.success("Trade Deleted ✅");
      fetchTrades();
    } catch (err) {
      toast.error("Delete failed ❌");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Trades Journal</h1>

      {/* Add Trade Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow mb-6 grid gap-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Symbol (e.g. EURUSD)"
            name="symbol"
            value={form.symbol}
            onChange={handleChange}
          />

          <select
            className="border p-2 rounded"
            name="side"
            value={form.side}
            onChange={handleChange}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Entry"
            name="entry"
            value={form.entry}
            onChange={handleChange}
          />
          <input
            className="border p-2 rounded"
            placeholder="Stop Loss"
            name="stopLoss"
            value={form.stopLoss}
            onChange={handleChange}
          />
          <input
            className="border p-2 rounded"
            placeholder="Take Profit"
            name="takeProfit"
            value={form.takeProfit}
            onChange={handleChange}
          />
        </div>

        <input
          className="border p-2 rounded"
          placeholder="Quantity"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
        />

        <textarea
          className="border p-2 rounded"
          placeholder="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />

        <button className="bg-black text-white py-2 rounded">
          Add Trade
        </button>
      </form>

      {/* Trades List */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">All Trades</h2>

        {trades.length === 0 ? (
          <p>No trades yet.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Symbol</th>
                <th className="p-2 border">Side</th>
                <th className="p-2 border">Entry</th>
                <th className="p-2 border">SL</th>
                <th className="p-2 border">TP</th>
                <th className="p-2 border">R</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t._id}>
                  <td className="p-2 border">{t.symbol}</td>
                  <td className="p-2 border">{t.side}</td>
                  <td className="p-2 border">{t.entry}</td>
                  <td className="p-2 border">{t.stopLoss}</td>
                  <td className="p-2 border">{t.takeProfit}</td>
                  <td className="p-2 border">{t.rMultiple?.toFixed(2)}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
