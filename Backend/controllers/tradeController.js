const Trade = require("../models/Trade");
const { calculatePnL } = require("../utils/pnlCalculator");

/**
 * Create / Journal a Trade
 * POST /api/trades
 */
exports.createTrade = async (req, res) => {
  try {
    // ✅ CORRECT USER ID
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

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

    // ✅ Required validation
    if (!symbol || !type || entryPrice === "" || lotSize === "" || !entryDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Safe number casting
    entryPrice = Number(entryPrice);
    lotSize = Number(lotSize);
    exitPrice =
      exitPrice !== undefined && exitPrice !== ""
        ? Number(exitPrice)
        : null;

    if (Number.isNaN(entryPrice) || Number.isNaN(lotSize)) {
      return res.status(400).json({ message: "Invalid numeric values" });
    }

    let pips = 0;
    let pnl = 0;
    let status = "OPEN";

    // ✅ CLOSED trade calculation only
    if (exitPrice !== null) {
      if (Number.isNaN(exitPrice)) {
        return res.status(400).json({ message: "Invalid exit price" });
      }

      const result = calculatePnL({
        symbol: symbol.toUpperCase(),
        type: type.toUpperCase(),
        entryPrice,
        exitPrice,
        lotSize,
      });

      pips = Number(result.pips) || 0;
      pnl = Number(result.pnl) || 0;
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
  } catch (error) {
    console.error("Create trade error:", error);
    res.status(500).json({ message: "Failed to create trade" });
  }
};


/**
 * Get all trades
 * GET /api/trades
 */
exports.getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user?.id })
      .sort({ entryDate: -1 }); // ✅ FIX 2: better sort

    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trades" });
  }
};

/**
 * Delete a trade
 * DELETE /api/trades/:id
 */
exports.deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.id, // ✅ FIX
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    res.json({ message: "Trade deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

/**
 * Close an OPEN trade
 * PUT /api/trades/:id/close
 */
exports.closeTrade = async (req, res) => {
  try {
    const { exitPrice, exitDate } = req.body;

    if (exitPrice == null) {
      return res.status(400).json({ message: "Exit price is required" });
    }

    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user?.id, // ✅ FIX
      status: "OPEN",
    });

    if (!trade) {
      return res.status(404).json({ message: "Open trade not found" });
    }

    const { pips, pnl } = calculatePnL({
      symbol: trade.symbol,
      type: trade.type,
      entryPrice: trade.entryPrice,
      exitPrice: Number(exitPrice),
      lotSize: trade.lotSize,
    });

    trade.exitPrice = Number(exitPrice);
    trade.exitDate = exitDate ? new Date(exitDate) : new Date();
    trade.pips = pips;
    trade.pnl = pnl;
    trade.status = "CLOSED";

    await trade.save();

    res.json(trade);
  } catch (error) {
    console.error("Close trade error:", error.message);
    res.status(500).json({ message: "Failed to close trade" });
  }
};
