const Journal = require("../models/Journal");
const Trade = require("../models/Trade");

/* =========================
   CREATE JOURNAL
========================= */
exports.createJournal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, accountBalance, riskPerTrade, isDefault } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Journal name is required" });
    }

    // Check if user already has a journal with the same name
    const existingJournal = await Journal.findOne({
      userId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingJournal) {
      return res
        .status(400)
        .json({ message: "A journal with this name already exists" });
    }

    // If isDefault is true, unset other default journals
    if (isDefault) {
      await Journal.updateMany(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    const journal = await Journal.create({
      userId,
      name: name.trim(),
      description: description?.trim() || "",
      accountBalance: accountBalance || 0,
      riskPerTrade: riskPerTrade || 1,
      isDefault: isDefault || false,
    });

    res.status(201).json(journal);
  } catch (err) {
    console.error("CREATE JOURNAL ERROR:", err);
    res.status(500).json({ message: "Failed to create journal" });
  }
};

/* =========================
   GET ALL JOURNALS FOR USER
========================= */
exports.getJournals = async (req, res) => {
  try {
    const userId = req.user.id;

    const journals = await Journal.find({ userId }).sort({
      createdAt: -1,
    });

    // Get trade counts for each journal
    const journalsWithCounts = await Promise.all(
      journals.map(async (journal) => {
        const tradeCount = await Trade.countDocuments({
          userId,
          journalId: journal._id,
        });
        return {
          ...journal.toObject(),
          tradeCount,
        };
      })
    );

    res.json(journalsWithCounts);
  } catch (err) {
    console.error("GET JOURNALS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch journals" });
  }
};

/* =========================
   GET JOURNAL BY ID
========================= */
exports.getJournalById = async (req, res) => {
  try {
    const userId = req.user.id;
    const journal = await Journal.findOne({
      _id: req.params.id,
      userId,
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    // Get trade count for this journal
    const tradeCount = await Trade.countDocuments({
      userId,
      journalId: journal._id,
    });

    res.json({
      ...journal.toObject(),
      tradeCount,
    });
  } catch (err) {
    console.error("GET JOURNAL ERROR:", err);
    res.status(500).json({ message: "Failed to fetch journal" });
  }
};

/* =========================
   UPDATE JOURNAL
========================= */
exports.updateJournal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, accountBalance, riskPerTrade, isDefault } =
      req.body;

    const journal = await Journal.findOne({
      _id: req.params.id,
      userId,
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    // Check for duplicate name if name is being changed
    if (name && name.trim() !== journal.name) {
      const existingJournal = await Journal.findOne({
        userId,
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: journal._id },
      });

      if (existingJournal) {
        return res
          .status(400)
          .json({ message: "A journal with this name already exists" });
      }
    }

    // If isDefault is true, unset other default journals
    if (isDefault && !journal.isDefault) {
      await Journal.updateMany(
        { userId, isDefault: true, _id: { $ne: journal._id } },
        { isDefault: false }
      );
    }

    journal.name = name?.trim() || journal.name;
    journal.description = description?.trim() ?? journal.description;
    journal.accountBalance = accountBalance ?? journal.accountBalance;
    journal.riskPerTrade = riskPerTrade ?? journal.riskPerTrade;
    journal.isDefault = isDefault ?? journal.isDefault;

    await journal.save();
    res.json(journal);
  } catch (err) {
    console.error("UPDATE JOURNAL ERROR:", err);
    res.status(500).json({ message: "Failed to update journal" });
  }
};

/* =========================
   DELETE JOURNAL
========================= */
exports.deleteJournal = async (req, res) => {
  try {
    const userId = req.user.id;
    const journalId = req.params.id;

    const journal = await Journal.findOne({
      _id: journalId,
      userId,
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    // Move trades from this journal to unassigned (null journalId)
    await Trade.updateMany({ userId, journalId }, { journalId: null });

    await Journal.findByIdAndDelete(journalId);
    res.json({ message: "Journal deleted successfully" });
  } catch (err) {
    console.error("DELETE JOURNAL ERROR:", err);
    res.status(500).json({ message: "Failed to delete journal" });
  }
};

/* =========================
   GET TRADES BY JOURNAL
========================= */
exports.getTradesByJournal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { journalId } = req.params;

    // If journalId is "all" or not provided, return all trades
    if (journalId === "all" || !journalId) {
      const trades = await Trade.find({ userId }).sort({ entryDate: -1 });
      return res.json(trades);
    }

    // If journalId is "unassigned", return trades without a journal
    if (journalId === "unassigned") {
      const trades = await Trade.find({
        userId,
        journalId: null,
      }).sort({ entryDate: -1 });
      return res.json(trades);
    }

    const journal = await Journal.findOne({
      _id: journalId,
      userId,
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    const trades = await Trade.find({
      userId,
      journalId,
    }).sort({ entryDate: -1 });

    res.json(trades);
  } catch (err) {
    console.error("GET TRADES BY JOURNAL ERROR:", err);
    res.status(500).json({ message: "Failed to fetch trades" });
  }
};

/* =========================
   GET OR CREATE DEFAULT JOURNAL
========================= */
exports.getOrCreateDefaultJournal = async (userId) => {
  let journal = await Journal.findOne({ userId, isDefault: true });

  if (!journal) {
    // Check if user has any journals
    journal = await Journal.findOne({ userId });

    if (!journal) {
      // Create a default journal for the user
      journal = await Journal.create({
        userId,
        name: "My Trading Journal",
        description: "Default trading journal",
        isDefault: true,
      });
    }
  }

  return journal;
};
