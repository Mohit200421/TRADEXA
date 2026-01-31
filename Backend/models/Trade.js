const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ---------- Core Trade Info ---------- */
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["LONG", "SHORT"],
      required: true,
    },

    lotSize: {
      type: Number,
      required: true,
      min: 0,
    },

    /* ---------- Prices ---------- */
    entryPrice: {
      type: Number,
      required: true,
    },

    exitPrice: {
      type: Number,
      default: null,
    },

    /* ---------- Dates ---------- */
    entryDate: {
      type: Date,
      required: true,
      index: true,
    },

    exitDate: {
      type: Date,
      default: null,
      index: true,
    },

    /* ---------- Calculated Metrics ---------- */
    pips: {
      type: Number,
      default: 0,
    },

    pnl: {
      type: Number,
      default: 0,
      index: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
      index: true,
    },

    /* ---------- Journal ---------- */
    journal: {
      preTrade: { type: String, default: "" },
      postTrade: { type: String, default: "" },
      emotions: { type: String, default: "" },
      lessons: { type: String, default: "" },
      tags: { type: String, default: "" },
      rating: { type: Number, default: 5 },

      checklist: {
        followedPlan: { type: Boolean, default: false },
        properRisk: { type: Boolean, default: false },
        goodEntry: { type: Boolean, default: false },
        patientExit: { type: Boolean, default: false },
      },

      screenshots: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/* ---------- Indexes for Dashboard Performance ---------- */
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ userId: 1, exitDate: -1 });
tradeSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Trade", tradeSchema);
