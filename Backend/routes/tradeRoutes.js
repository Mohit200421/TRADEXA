const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const uploadScreenshots = require("../middleware/uploadScreenshots");

const {
  createTrade,
  getTrades,
  deleteTrade,
  closeTrade,
  updateTradeJournal,
} = require("../controllers/tradeController");

router.post("/", auth, uploadScreenshots.array("screenshots", 5), createTrade);

router.get("/", auth, getTrades);
router.delete("/:id", auth, deleteTrade);
router.put("/:id/close", auth, closeTrade);

router.put(
  "/:id/journal",
  auth,
  uploadScreenshots.array("screenshots", 5),
  updateTradeJournal
);

module.exports = router;
