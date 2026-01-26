const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createOrUpdateReview,
  getReviews,
  getReviewDates,
} = require("../controllers/reviewController");

const router = express.Router();


router.use(protect);

router.post("/", createOrUpdateReview);
router.get("/", getReviews);
router.get("/dates", getReviewDates);

module.exports = router;
