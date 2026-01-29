import { useEffect, useState } from "react";
import API from "../api/axios";

export interface DashboardSummary {
  totalPnL: number;
  winRate: number;
  performance: {
    date: string;
    pnl: number;
  }[];
  monthlyPnL: Record<string, number>;
  quickStats: {
    avgWin: number;
    avgLoss: number;
    bestTrade: number;
    worstTrade: number;
    profitFactor: number;
  };
  recentActivity: {
    symbol: string;
    type: "LONG" | "SHORT";
    pnl: number;
    lotSize: number;
    createdAt: string;
  }[];
}

export function useDashboardSummary(
  range: "1D" | "1W" | "1M" | "ALL"
) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await API.get(
          `/dashboard/summary?range=${range}`
        );

        setData(res.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [range]); // 🔥 important

  return { data, loading, error };
}
