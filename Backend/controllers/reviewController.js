
const PDFDocument = require("pdfkit");
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



exports.exportReviewsPDF = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;

    const reviews = await Review.find(filter).sort({ date: -1 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reviews.pdf");

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    doc.fontSize(18).text("TradeFX Reviews Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Export Type: ${type || "ALL"}`);
    doc.text(`Generated At: ${new Date().toLocaleString()}`);
    doc.moveDown();

    if (reviews.length === 0) {
      doc.fontSize(14).text("No reviews found.");
      doc.end();
      return;
    }

    reviews.forEach((r, index) => {
      doc
        .fontSize(14)
        .text(`${index + 1}. ${r.type} Review - ${r.date}`, { underline: true });

      doc.moveDown(0.5);

      doc.fontSize(11).text(`Mood: ${r.mood || "-"}`);
      doc.moveDown(0.3);

      doc.fontSize(11).text(`Summary: ${r.summary || "-"}`);
      doc.moveDown(0.3);

      doc.fontSize(11).text(`Mistakes: ${r.mistakes || "-"}`);
      doc.moveDown(0.3);

      doc.fontSize(11).text(`Lessons: ${r.lessons || "-"}`);
      doc.moveDown(0.3);

      doc.fontSize(11).text(`Plan: ${r.plan || "-"}`);
      doc.moveDown();

      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "PDF export failed" });
  }
};
