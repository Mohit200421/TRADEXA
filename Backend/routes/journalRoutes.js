const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  getTradesByJournal,
} = require("../controllers/journalController");

// Journal CRUD routes
router.post("/", auth, createJournal);
router.get("/", auth, getJournals);
router.get("/:id", auth, getJournalById);
router.put("/:id", auth, updateJournal);
router.delete("/:id", auth, deleteJournal);

// Get trades by journal
router.get("/:journalId/trades", auth, getTradesByJournal);

module.exports = router;
