const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY"],
      required: true,
    },

    date: { type: String, required: true }, // "2026-01-26"

    summary: { type: String, default: "" },
    mistakes: { type: String, default: "" },
    lessons: { type: String, default: "" },
    plan: { type: String, default: "" },
    mood: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, type: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
