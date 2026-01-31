const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  createTrade,
  getTrades,
  deleteTrade,
  closeTrade,
  updateTradeJournal,
} = require("../controllers/tradeController");

router.post("/", auth, createTrade);
router.get("/", auth, getTrades);
router.delete("/:id", auth, deleteTrade);
router.put("/:id/close", auth, closeTrade);

// ✅ FIX: ADD auth HERE
router.patch("/:id/journal", auth, updateTradeJournal);

module.exports = router;
