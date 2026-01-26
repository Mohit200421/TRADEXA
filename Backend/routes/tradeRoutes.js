const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createTrade,
  getTrades,
  getTradeById,
  updateTrade,
  deleteTrade,
  getAnalyticsSummary, // ✅ ADD THIS
  getEquityCurve,
} = require("../controllers/tradeController");

const router = express.Router();

// Protect all routes below
router.use(protect);

// ✅ Analytics route (must be above /:id)
router.get("/analytics/summary", getAnalyticsSummary);

router.get("/analytics/equity-curve", getEquityCurve);

// Trades CRUD
router.route("/").post(createTrade).get(getTrades);

router.route("/:id").get(getTradeById).put(updateTrade).delete(deleteTrade);

module.exports = router;
