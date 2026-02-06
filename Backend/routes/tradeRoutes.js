const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const uploadScreenshots = require("../middleware/uploadScreenshots");

const {
  createTrade,
  getTrades,
  getTradeById,        // ✅ ADD
  deleteTrade,
  closeTrade,
  updateTrade,
  updateTradeJournal,
} = require("../controllers/tradeController");

router.post("/", auth, uploadScreenshots.array("screenshots", 5), createTrade);

router.get("/", auth, getTrades);
router.get("/:id", auth, getTradeById);      // ✅ ADD HERE

router.put("/:id", auth, updateTrade);
router.put("/:id/close", auth, closeTrade);

router.put(
  "/:id/journal",
  auth,
  uploadScreenshots.array("screenshots", 5),
  updateTradeJournal
);

router.delete("/:id", auth, deleteTrade);


module.exports = router;
