const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  getEquityCurve,
  getPerformance,
} = require("../controllers/analyticsController");

// Get equity curve data
router.get("/equity-curve/:journalId", auth, getEquityCurve);

// Get performance metrics
router.get("/performance/:journalId", auth, getPerformance);

module.exports = router;
