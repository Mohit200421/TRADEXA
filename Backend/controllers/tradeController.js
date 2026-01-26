const Trade = require("../models/Trade");


// Helper: calculate PnL + R-multiple (basic)
const calculateTradeMetrics = ({ side, entry, stopLoss, takeProfit, quantity }) => {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);

  const rMultiple = risk === 0 ? 0 : reward / risk;

  // simple pnl estimation (not exact for all brokers)
  const pnl = (reward * quantity) * (side === "BUY" ? 1 : 1);

  return { pnl, rMultiple };
};

// ✅ Create Trade
exports.createTrade = async (req, res) => {
  try {
    const {
      accountName,
      date,
      symbol,
      side,
      entry,
      stopLoss,
      takeProfit,
      quantity,
      status,
      notes,
      tags,
      emotions,
      mistakes,
      screenshotUrl,
    } = req.body;

    if (!symbol || !side || entry == null || stopLoss == null || takeProfit == null) {
      return res.status(400).json({ message: "Symbol, side, entry, SL, TP required" });
    }

    const { pnl, rMultiple } = calculateTradeMetrics({
      side,
      entry,
      stopLoss,
      takeProfit,
      quantity: quantity || 1,
    });

    const trade = await Trade.create({
      user: req.user._id,
      accountName,
      date,
      symbol,
      side,
      entry,
      stopLoss,
      takeProfit,
      quantity,
      status,
      notes,
      tags,
      emotions,
      mistakes,
      screenshotUrl,
      pnl,
      rMultiple,
    });

    return res.status(201).json(trade);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Trades (User Specific)
exports.getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id }).sort({ date: -1 });
    return res.status(200).json(trades);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Get Single Trade
exports.getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    return res.status(200).json(trade);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Update Trade
exports.updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    Object.assign(trade, req.body);

    // Recalculate if core fields changed
    const { pnl, rMultiple } = calculateTradeMetrics({
      side: trade.side,
      entry: trade.entry,
      stopLoss: trade.stopLoss,
      takeProfit: trade.takeProfit,
      quantity: trade.quantity || 1,
    });

    trade.pnl = pnl;
    trade.rMultiple = rMultiple;

    const updated = await trade.save();
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Trade
exports.deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, user: req.user._id });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    await trade.deleteOne();
    return res.status(200).json({ message: "Trade deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAnalyticsSummary = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.id });

    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.pnl > 0).length;
    const losses = trades.filter((t) => t.pnl < 0).length;

    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin =
      wins === 0
        ? 0
        : trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / wins;

    const avgLoss =
      losses === 0
        ? 0
        : trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0) / losses;

    const winRate = totalTrades === 0 ? 0 : (wins / totalTrades) * 100;

    res.json({
      totalTrades,
      wins,
      losses,
      totalPnL,
      avgWin,
      avgLoss,
      winRate,
    });
  } catch (error) {
    res.status(500).json({ message: "Analytics error" });
  }
};

exports.getEquityCurve = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.id }).sort({ createdAt: 1 });

    let equity = 0;
    const curve = trades.map((t) => {
      equity += t.pnl || 0;
      return {
        date: t.createdAt.toISOString().slice(0, 10),
        equity,
        pnl: t.pnl || 0,
      };
    });

    res.json(curve);
  } catch (err) {
    res.status(500).json({ message: "Equity curve error" });
  }
};

exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.id });

    const monthly = {};

    trades.forEach((t) => {
      const date = new Date(t.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthly[key]) {
        monthly[key] = { month: key, pnl: 0, trades: 0, wins: 0, losses: 0 };
      }

      monthly[key].pnl += t.pnl || 0;
      monthly[key].trades += 1;

      if ((t.pnl || 0) > 0) monthly[key].wins += 1;
      if ((t.pnl || 0) < 0) monthly[key].losses += 1;
    });

    const result = Object.values(monthly).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Monthly analytics error" });
  }
};


exports.getAdvancedAnalytics = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user.id }).sort({ createdAt: 1 });

    let equity = 0;
    let peak = 0;
    let maxDrawdown = 0;

    const symbolStats = {};
    const setupStats = {};

    trades.forEach((t) => {
      const pnl = t.pnl || 0;
      equity += pnl;

      if (equity > peak) peak = equity;
      const dd = peak - equity;
      if (dd > maxDrawdown) maxDrawdown = dd;

      // Symbol performance
      const sym = (t.symbol || "UNKNOWN").toUpperCase();
      if (!symbolStats[sym]) symbolStats[sym] = { symbol: sym, pnl: 0, trades: 0 };
      symbolStats[sym].pnl += pnl;
      symbolStats[sym].trades += 1;

      // Setup performance
      const setup = t.setup || "NO_SETUP";
      if (!setupStats[setup]) setupStats[setup] = { setup, pnl: 0, trades: 0 };
      setupStats[setup].pnl += pnl;
      setupStats[setup].trades += 1;
    });

    const bestSymbols = Object.values(symbolStats)
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);

    const bestSetups = Object.values(setupStats)
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);

    res.json({
      maxDrawdown,
      bestSymbols,
      bestSetups,
    });
  } catch (error) {
    res.status(500).json({ message: "Advanced analytics error" });
  }
};
