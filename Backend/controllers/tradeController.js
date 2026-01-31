const Trade = require("../models/Trade");
const { calculatePnL } = require("../utils/pnlCalculator");

/**
 * CREATE TRADE
 */
exports.createTrade = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ SINGLE SOURCE

    let {
      symbol,
      type,
      entryPrice,
      exitPrice,
      lotSize,
      entryDate,
      exitDate,
      notes,
    } = req.body;

    if (!symbol || !type || entryPrice === "" || lotSize === "" || !entryDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    entryPrice = Number(entryPrice);
    lotSize = Number(lotSize);
    exitPrice = exitPrice !== "" && exitPrice != null ? Number(exitPrice) : null;

    let pips = 0;
    let pnl = 0;
    let status = "OPEN";

    if (exitPrice !== null) {
      const result = calculatePnL({
        symbol: symbol.toUpperCase(),
        type: type.toUpperCase(),
        entryPrice,
        exitPrice,
        lotSize,
      });

      pips = result.pips;
      pnl = result.pnl;
      status = "CLOSED";
    }

    const trade = await Trade.create({
      userId,
      symbol: symbol.toUpperCase(),
      type: type.toUpperCase(),
      entryPrice,
      exitPrice,
      lotSize,
      entryDate: new Date(entryDate),
      exitDate: exitDate ? new Date(exitDate) : null,
      pips,
      pnl,
      status,
      notes: notes || "",
    });

    res.status(201).json(trade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create trade" });
  }
};

/**
 * GET TRADES
 */
exports.getTrades = async (req, res) => {
  const trades = await Trade.find({ userId: req.user.id })
    .sort({ entryDate: -1 });
  res.json(trades);
};

/**
 * DELETE TRADE
 */
exports.deleteTrade = async (req, res) => {
  const trade = await Trade.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!trade) {
    return res.status(404).json({ message: "Trade not found" });
  }

  res.json({ message: "Trade deleted" });
};

/**
 * CLOSE TRADE
 */
exports.closeTrade = async (req, res) => {
  const trade = await Trade.findOne({
    _id: req.params.id,
    userId: req.user.id,
    status: "OPEN",
  });

  if (!trade) {
    return res.status(404).json({ message: "Open trade not found" });
  }

  const { pips, pnl } = calculatePnL({
    symbol: trade.symbol,
    type: trade.type,
    entryPrice: trade.entryPrice,
    exitPrice: Number(req.body.exitPrice),
    lotSize: trade.lotSize,
  });

  trade.exitPrice = Number(req.body.exitPrice);
  trade.exitDate = new Date();
  trade.pips = pips;
  trade.pnl = pnl;
  trade.status = "CLOSED";

  await trade.save();
  res.json(trade);
};

/**
 * UPDATE TRADE JOURNAL
 */
/**
 * UPDATE TRADE JOURNAL
 */
exports.updateTradeJournal = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    trade.journal = {
      preTrade: req.body.preTrade || "",
      postTrade: req.body.postTrade || "",
      emotions: req.body.emotions || "",
      lessons: req.body.lessons || "",
      tags: req.body.tags || "",
      rating: req.body.rating ?? 5,
      checklist: req.body.checklist || {},
      screenshots: req.body.screenshots || [],
    };

    await trade.save();
    res.json(trade);
  } catch (err) {
    console.error("JOURNAL SAVE ERROR:", err);
    res.status(500).json({ message: "Journal save failed" });
  }
};
