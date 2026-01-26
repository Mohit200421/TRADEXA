const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountName: {
      type: String,
      default: "Main",
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    side: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },

    entry: {
      type: Number,
      required: true,
    },

    stopLoss: {
      type: Number,
      required: true,
    },

    takeProfit: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    status: {
      type: String,
      enum: ["WIN", "LOSS", "BREAKEVEN", "RUNNING"],
      default: "RUNNING",
    },

    notes: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    emotions: {
      type: [String],
      default: [],
    },

    mistakes: {
      type: [String],
      default: [],
    },

    screenshotUrl: {
      type: String,
      default: "",
    },

    pnl: {
      type: Number,
      default: 0,
    },

    rMultiple: {
      type: Number,
      default: 0,
    },
    screenshotUrl: {
      type: String,
      default: "",
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trade", tradeSchema);
