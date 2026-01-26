import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getTradeById, deleteTrade } from "../services/tradeService";

export default function TradeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrade = async () => {
    try {
      const res = await getTradeById(id as string);
      setTrade(res.data);
    } catch {
      toast.error("Trade not found ❌");
      navigate("/trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrade();
  }, []);

  const handleDelete = async () => {
    if (!trade?._id) return;
    await deleteTrade(trade._id);
    toast.success("Trade Deleted ✅");
    navigate("/trades");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/trades")}
        className="mb-4 px-4 py-2 bg-gray-200 rounded"
      >
        ← Back
      </button>

      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-3">
          {trade.symbol} ({trade.side})
        </h1>

        <p><b>Entry:</b> {trade.entry}</p>
        <p><b>Stop Loss:</b> {trade.stopLoss}</p>
        <p><b>Take Profit:</b> {trade.takeProfit}</p>
        <p><b>Quantity:</b> {trade.quantity}</p>
        <p><b>Notes:</b> {trade.notes || "-"}</p>

        {trade.screenshotUrl && (
          <div className="mt-4">
            <h2 className="font-semibold mb-2">Screenshot</h2>
            <img
              src={trade.screenshotUrl}
              alt="Trade Screenshot"
              className="w-full max-w-xl rounded border"
            />
          </div>
        )}

        <button
          onClick={handleDelete}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete Trade
        </button>
      </div>
    </div>
  );
}
