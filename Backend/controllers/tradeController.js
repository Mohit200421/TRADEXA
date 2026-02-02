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

    /* ---------- PARSE JOURNAL ---------- */
    let journalData = {};
    if (journal) {
      journalData = JSON.parse(journal);
    }

    /* ---------- UPLOAD SCREENSHOTS ---------- */
    let screenshots = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "tradexa/journals" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        screenshots.push(uploaded.secure_url);
      }
    }

    /* ---------- CREATE TRADE ---------- */
    const trade = await Trade.create({
      userId,
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
   GET TRADES
========================= */
exports.getTrades = async (req, res) => {
  const trades = await Trade.find({ userId: req.user.id }).sort({
    entryDate: -1,
  });
  res.json(trades);
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
   UPDATE JOURNAL
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

    let journalData = req.body.journal
      ? JSON.parse(req.body.journal)
      : req.body;

    let screenshots = trade.journal?.screenshots || [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "tradexa/journals" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        screenshots.push(uploaded.secure_url);
      }
    }

    trade.journal = {
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
