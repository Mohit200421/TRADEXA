const mongoose = require("mongoose");

const traderProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      trim: true,
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    bio: {
      type: String,
      maxlength: 300,
    },

    avatar: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },

    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Pro"],
      default: "Beginner",
    },

    primaryMarket: {
      type: String,
      enum: ["Forex", "Crypto", "Stocks", "Indices", "Commodities"],
    },

    tradingStyle: {
      type: String,
      enum: ["Scalping", "Intraday", "Swing", "Position"],
    },

    accountCurrency: {
      type: String,
      default: "USD",
    },

    defaultLotType: {
      type: String,
      enum: ["Micro", "Mini", "Standard"],
      default: "Micro",
    },

    riskPerTrade: {
      type: Number,
      min: 0.1,
      max: 10,
      default: 1,
    },

    timezone: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TraderProfile", traderProfileSchema);
