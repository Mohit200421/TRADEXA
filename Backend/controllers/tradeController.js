const Trade = require("../models/Trade");
const { calculatePnL } = require("../utils/pnlCalculator");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/* =========================
   CREATE TRADE + JOURNAL + SS
========================= */
exports.createTrade = async (req, res) => {
  try {
    const userId = req.user.id;

    let {
      symbol,
      type,
      entryPrice,
      exitPrice,
      lotSize,
      entryDate,
      exitDate,
      journal,
      journalId,
    } = req.body;

    if (!symbol || !type || !entryPrice || !lotSize || !entryDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    entryPrice = Number(entryPrice);
    lotSize = Number(lotSize);

    let safeExitPrice = null;
    if (exitPrice !== "" && exitPrice !== null && exitPrice !== undefined) {
      safeExitPrice = Number(exitPrice);
    }

    let pips = 0;
    let pnl = 0;
    let status = "OPEN";

    if (safeExitPrice !== null) {
      const result = calculatePnL({
        symbol: symbol.toUpperCase(),
        type: type.toUpperCase(),
        entryPrice,
        exitPrice: safeExitPrice,
        lotSize,
      });

      pips = result?.pips || 0;
      pnl = result?.pnl || 0;
      status = "CLOSED";
    }

    let journalData = {};
    if (journal) journalData = JSON.parse(journal);

    // Check if journal has meaningful content
    const isJournaled = Boolean(
      journalData.preTrade?.trim() ||
        journalData.postTrade?.trim() ||
        journalData.emotions?.trim() ||
        journalData.lessons?.trim()
    );

    let screenshots = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "tradexa/journals" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        screenshots.push(uploaded.secure_url);
      }
    }

    const trade = await Trade.create({
      userId,
      journalId: journalId || null,
      symbol: symbol.toUpperCase(),
      type: type.toUpperCase(),
      entryPrice,
      exitPrice: safeExitPrice,
      lotSize,
      entryDate: new Date(entryDate),
      exitDate: exitDate ? new Date(exitDate) : null,
      pips,
      pnl,
      status,
      journal: {
        preTrade: journalData.preTrade || "",
        postTrade: journalData.postTrade || "",
        emotions: journalData.emotions || "",
        lessons: journalData.lessons || "",
        tags: journalData.tags || "",
        rating: journalData.rating ?? 5,
        checklist: journalData.checklist || {},
        screenshots,
      },
    });

    res.status(201).json(trade);
  } catch (err) {
    console.error("CREATE TRADE ERROR:", err);
    res.status(500).json({ message: "Failed to create trade" });
  }
};

/* =========================
   GET ALL TRADES
========================= */
exports.getTrades = async (req, res) => {
  const { journalId } = req.query;
  const query = { userId: req.user.id };

  // Filter by journalId if provided
  if (journalId && journalId !== "all") {
    if (journalId === "unassigned") {
      query.journalId = null;
    } else {
      query.journalId = journalId;
    }
  }

  const trades = await Trade.find(query).sort({
    entryDate: -1,
  });
  res.json(trades);
};

/* =========================
   GET TRADE BY ID
========================= */
exports.getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    res.json(trade);
  } catch (err) {
    console.error("GET TRADE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch trade" });
  }
};

/* =========================
   DELETE TRADE
========================= */
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

/* =========================
   CLOSE TRADE
========================= */
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
  trade.pips = pips || 0;
  trade.pnl = pnl || 0;
  trade.status = "CLOSED";

  await trade.save();
  res.json(trade);
};

/* =========================
   UPDATE TRADE (FULL EDIT)
========================= */
exports.updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    let {
      symbol,
      type,
      entryPrice,
      exitPrice,
      lotSize,
      entryDate,
      exitDate,
      journalId,
    } = req.body;

    entryPrice = Number(entryPrice);
    lotSize = Number(lotSize);

    let safeExitPrice = null;
    if (exitPrice !== "" && exitPrice !== null && exitPrice !== undefined) {
      safeExitPrice = Number(exitPrice);
    }

    let pips = 0;
    let pnl = 0;
    let status = "OPEN";

    if (safeExitPrice !== null) {
      const result = calculatePnL({
        symbol: symbol.toUpperCase(),
        type: type.toUpperCase(),
        entryPrice,
        exitPrice: safeExitPrice,
        lotSize,
      });

      pips = result?.pips || 0;
      pnl = result?.pnl || 0;
      status = "CLOSED";
    }

    trade.symbol = symbol.toUpperCase();
    trade.type = type.toUpperCase();
    trade.entryPrice = entryPrice;
    trade.exitPrice = safeExitPrice;
    trade.lotSize = lotSize;
    trade.entryDate = new Date(entryDate);
    trade.exitDate = exitDate ? new Date(exitDate) : null;
    trade.pips = pips;
    trade.pnl = pnl;
    trade.status = status;
    trade.journalId = journalId || null;

    await trade.save();
    res.json(trade);
  } catch (err) {
    console.error("UPDATE TRADE ERROR:", err);
    res.status(500).json({ message: "Failed to update trade" });
  }
};

/* =========================
   UPDATE JOURNAL + SCREENSHOTS
========================= */
exports.updateTradeJournal = async (req, res) => {
  try {
    const trade = await Trade.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    const journalData = req.body.journal
      ? JSON.parse(req.body.journal)
      : req.body;

    let screenshots = Array.isArray(journalData.screenshots)
      ? journalData.screenshots
      : trade.journal?.screenshots || [];

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "tradexa/journals" },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
        screenshots.push(uploaded.secure_url);
      }
    }

    trade.journal = {
      ...trade.journal,
      ...journalData,
      screenshots,
    };

    await trade.save();
    res.json(trade);
  } catch (err) {
    console.error("JOURNAL SAVE ERROR:", err);
    res.status(500).json({ message: "Journal save failed" });
  }
};
