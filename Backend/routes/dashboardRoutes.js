const express = require("express");
const router = express.Router();
const { getDashboardSummary } = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

/**
 * Dashboard summary
 * GET /api/dashboard/summary
 * Query params:
 *  - range = 1D | 1W | 1M | ALL
 */
router.get("/summary", auth, getDashboardSummary);

module.exports = router;
