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
