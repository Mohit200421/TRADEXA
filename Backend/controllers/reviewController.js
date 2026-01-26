const Review = require("../models/Review");

exports.createOrUpdateReview = async (req, res) => {
  try {
    const { type, date, summary, mistakes, lessons, plan, mood } = req.body;

    if (!type || !date) {
      return res.status(400).json({ message: "Type and date are required" });
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user.id, type, date },
      { summary, mistakes, lessons, plan, mood },
      { new: true, upsert: true }
    );

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Review save failed" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;

    const reviews = await Review.find(filter).sort({ date: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Review fetch failed" });
  }
};

exports.getReviewDates = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;

    const reviews = await Review.find(filter).select("date type");
    const dates = reviews.map((r) => r.date);

    res.json({ dates });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch review dates" });
  }
};
