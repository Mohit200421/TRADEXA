const express = require("express");
const protect = require("../middleware/auth");
const {
  createOrUpdateReview,
  getReviews,
  getReviewDates,
  exportReviewsPDF,
} = require("../controllers/reviewController");

const router = express.Router();

router.use(protect);

router.post("/", createOrUpdateReview);
router.get("/", getReviews);
router.get("/dates", getReviewDates);
router.get("/export/pdf", exportReviewsPDF);

module.exports = router;
