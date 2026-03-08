const Trade = require("../models/Trade");
const Journal = require("../models/Journal");

/**
 * GET /api/analytics/equity-curve/:journalId
 * Returns equity curve data for a specific journal
 */
exports.getEquityCurve = async (req, res) => {
  try {
    const { journalId } = req.params;
    const userId = req.user.id;

    // Get journal to find initial balance
    let initialBalance = 0;
    let journalName = "All Journals";

    if (journalId && journalId !== "all") {
      const journal = await Journal.findOne({ _id: journalId, userId });
      if (journal) {
        initialBalance = journal.initialBalance || 0;
        journalName = journal.name;
      }
    }

    // Build query
    const query = {
      userId,
      status: "CLOSED",
      exitDate: { $exists: true, $ne: null },
    };

    if (journalId && journalId !== "all") {
      query.journalId = journalId;
    }

    // Fetch and sort trades by exit date
    const trades = await Trade.find(query).sort({ exitDate: 1 });

    // Calculate equity curve
    let currentEquity = initialBalance;
    const equityCurve = trades.map((trade) => {
      currentEquity += trade.pnl;
      return {
        date: trade.exitDate.toISOString().split("T")[0],
        equity: Number(currentEquity.toFixed(2)),
        pnl: trade.pnl,
        symbol: trade.symbol,
        tradeId: trade._id,
      };
    });

    // Calculate drawdowns
    let peak = initialBalance;
    const drawdowns = [];
    let maxDrawdown = 0;
    let maxDrawdownDate = "";
    let maxDrawdownPercent = 0;

    equityCurve.forEach((point) => {
      if (point.equity > peak) {
        peak = point.equity;
      }
      const drawdown = peak - point.equity;
      const drawdownPercent =
        initialBalance > 0 ? (drawdown / initialBalance) * 100 : 0;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownDate = point.date;
        maxDrawdownPercent = drawdownPercent;
      }

      if (drawdown > 0) {
        drawdowns.push({
          date: point.date,
          drawdown: Number(drawdown.toFixed(2)),
          drawdownPercent: Number(drawdownPercent.toFixed(2)),
          equity: point.equity,
        });
      }
    });

    // Summary stats
    const summary = {
      initialBalance,
      finalEquity: currentEquity,
      totalPnL: Number((currentEquity - initialBalance).toFixed(2)),
      totalReturn:
        initialBalance > 0
          ? Number(
              (
                ((currentEquity - initialBalance) / initialBalance) *
                100
              ).toFixed(2)
            )
          : 0,
      maxDrawdown: Number(maxDrawdown.toFixed(2)),
      maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(2)),
      maxDrawdownDate,
      totalTrades: trades.length,
      winningTrades: trades.filter((t) => t.pnl > 0).length,
      losingTrades: trades.filter((t) => t.pnl < 0).length,
    };

    res.json({
      journalId: journalId || "all",
      journalName,
      initialBalance,
      equityCurve,
      drawdowns: drawdowns.slice(-20), // Last 20 drawdowns
      summary,
    });
  } catch (error) {
    console.error("Equity Curve error:", error.message);
    res.status(500).json({ message: "Failed to load equity curve" });
  }
};

/**
 * GET /api/analytics/performance/:journalId
 * Returns detailed performance metrics
 */
exports.getPerformance = async (req, res) => {
  try {
    const { journalId } = req.params;
    const userId = req.user.id;

    // Get journal
    let initialBalance = 0;
    if (journalId && journalId !== "all") {
      const journal = await Journal.findOne({ _id: journalId, userId });
      if (journal) {
        initialBalance = journal.initialBalance || 0;
      }
    }

    // Build query
    const query = {
      userId,
      status: "CLOSED",
    };

    if (journalId && journalId !== "all") {
      query.journalId = journalId;
    }

    const trades = await Trade.find(query).sort({ exitDate: 1 });

    // Calculate metrics
    const winningTrades = trades.filter((t) => t.pnl > 0);
    const losingTrades = trades.filter((t) => t.pnl < 0);

    const totalTrades = trades.length;
    const winRate =
      totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));

    const avgWin =
      winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const avgLoss =
      losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

    // Expectancy
    const winRateDecimal = winRate / 100;
    const expectancy = winRateDecimal * avgWin - (1 - winRateDecimal) * avgLoss;

    // Risk/Reward
    const riskReward = avgLoss > 0 ? avgWin / avgLoss : 0;

    // Consecutive wins/losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    trades.forEach((trade) => {
      if (trade.pnl > 0) {
        currentWins++;
        currentLosses = 0;
        if (currentWins > maxConsecutiveWins) maxConsecutiveWins = currentWins;
      } else if (trade.pnl < 0) {
        currentLosses++;
        currentWins = 0;
        if (currentLosses > maxConsecutiveLosses)
          maxConsecutiveLosses = currentLosses;
      }
    });

    // Monthly breakdown
    const monthlyData = {};
    trades.forEach((trade) => {
      if (!trade.exitDate) return;
      const monthKey = trade.exitDate.toISOString().slice(0, 7);
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { trades: 0, pnl: 0, wins: 0, losses: 0 };
      }
      monthlyData[monthKey].trades++;
      monthlyData[monthKey].pnl += trade.pnl;
      if (trade.pnl > 0) monthlyData[monthKey].wins++;
      else monthlyData[monthKey].losses++;
    });

    // Convert to array and sort by date
    const monthlyStats = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totalTrades,
      winRate: winRate.toFixed(2),
      totalPnL: totalPnL.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      expectancy: expectancy.toFixed(2),
      riskReward: riskReward.toFixed(2),
      maxConsecutiveWins,
      maxConsecutiveLosses,
      initialBalance,
      currentBalance: initialBalance + totalPnL,
      returnPercent:
        initialBalance > 0 ? ((totalPnL / initialBalance) * 100).toFixed(2) : 0,
      monthlyStats,
    });
  } catch (error) {
    console.error("Performance error:", error.message);
    res.status(500).json({ message: "Failed to load performance data" });
  }
};
