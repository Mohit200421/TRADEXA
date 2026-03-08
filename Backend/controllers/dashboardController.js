const Trade = require("../models/Trade");
const Journal = require("../models/Journal");

/**
 * GET /api/dashboard/summary
 * Query params:
 *  - range = 1D | 1W | 1M | ALL (default ALL)
 *  - journalId = specific journal ID (optional)
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const range = (req.query.range || "ALL").toUpperCase();
    const journalId = req.query.journalId;

    /* ================= JOURNAL INFO ================= */
    let journal = null;
    let initialBalance = 0;

    if (journalId && journalId !== "all") {
      journal = await Journal.findOne({ _id: journalId, userId });
      if (journal) {
        initialBalance = journal.initialBalance || 0;
      }
    }

    /* ================= RANGE HANDLING ================= */
    let startDate = null;
    const now = new Date();

    if (range === "1D") {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    }

    if (range === "1W") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    }

    if (range === "1M") {
      startDate = new Date();
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    /* ================= QUERY ================= */
    const query = {
      userId,
      status: "CLOSED",
    };

    // Filter by journal if specified
    if (journalId && journalId !== "all") {
      query.journalId = journalId;
    }

    if (startDate) {
      query.exitDate = { $gte: startDate };
    }

    const trades = await Trade.find(query).sort({ exitDate: 1 });

    let totalPnL = 0;
    let winningTrades = 0;
    let losingTrades = 0;

    const profits = [];
    const losses = [];

    /* ================= PERFORMANCE CURVE ================= */
    let cumulativePnL = 0;
    const performance = [];

    trades.forEach((trade) => {
      if (!trade.exitDate) return;

      totalPnL += trade.pnl;
      cumulativePnL += trade.pnl;

      performance.push({
        date: trade.exitDate.toISOString().split("T")[0],
        pnl: Number(cumulativePnL.toFixed(2)),
      });

      if (trade.pnl > 0) {
        winningTrades++;
        profits.push(trade.pnl);
      } else if (trade.pnl < 0) {
        losingTrades++;
        losses.push(trade.pnl);
      }
    });

    const totalTrades = winningTrades + losingTrades;

    const winRate =
      totalTrades > 0
        ? Number(((winningTrades / totalTrades) * 100).toFixed(2))
        : 0;

    /* ================= RETURN ON CAPITAL ================= */
    let returnOnCapital = 0;
    if (initialBalance > 0) {
      returnOnCapital = Number(((totalPnL / initialBalance) * 100).toFixed(2));
    }

    /* ================= QUICK STATS ================= */
    const avgWin =
      profits.length > 0
        ? Number(
            (profits.reduce((a, b) => a + b, 0) / profits.length).toFixed(2)
          )
        : 0;

    const avgLoss =
      losses.length > 0
        ? Number((losses.reduce((a, b) => a + b, 0) / losses.length).toFixed(2))
        : 0;

    const bestTrade = profits.length > 0 ? Math.max(...profits) : 0;
    const worstTrade = losses.length > 0 ? Math.min(...losses) : 0;

    let profitFactor = 0;
    if (losses.length > 0) {
      const totalProfit = profits.reduce((a, b) => a + b, 0);
      const totalLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
      profitFactor = Number((totalProfit / totalLoss).toFixed(2));
    }

    /* ================= EXPECTANCY ================= */
    const winRateDecimal = totalTrades > 0 ? winningTrades / totalTrades : 0;
    const lossRateDecimal = 1 - winRateDecimal;

    const expectancy =
      winRateDecimal * avgWin - lossRateDecimal * Math.abs(avgLoss);

    /* ================= MAX DRAWDOWN ================= */
    let peak = 0;
    let maxDrawdown = 0;

    performance.forEach((point) => {
      if (point.pnl > peak) peak = point.pnl;
      const drawdown = peak - point.pnl;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    /* ================= MONTHLY / DAILY P&L ================= */
    const monthlyPnL = {};
    trades.forEach((trade) => {
      if (!trade.exitDate) return;

      const date = trade.exitDate.toISOString().split("T")[0];
      monthlyPnL[date] = Number(
        ((monthlyPnL[date] || 0) + trade.pnl).toFixed(2)
      );
    });

    /* ================= RECENT ACTIVITY (TODAY) ================= */
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const recentActivityQuery = {
      userId,
      createdAt: { $gte: startOfToday },
    };

    // Filter recent activity by journal if specified
    if (journalId && journalId !== "all") {
      recentActivityQuery.journalId = journalId;
    }

    const recentActivity = await Trade.find(recentActivityQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("symbol type pnl lotSize createdAt");

    /* ================= RESPONSE ================= */
    res.json({
      totalTrades,
      totalPnL: Number(totalPnL.toFixed(2)),
      winRate,
      returnOnCapital,
      initialBalance,
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      performance,
      monthlyPnL,
      quickStats: {
        avgWin,
        avgLoss,
        bestTrade,
        worstTrade,
        profitFactor,
        expectancy: Number(expectancy.toFixed(2)),
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
