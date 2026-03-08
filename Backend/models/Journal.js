const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    initialBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    riskPerTrade: {
      type: Number,
      default: 1,
      min: 0,
      max: 100,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

/* ---------- Virtual for current balance ---------- */
journalSchema.virtual("currentBalance").get(function () {
  // This will be computed in the controller
  return this._currentBalance;
});

/* ---------- Indexes ---------- */
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model("Journal", journalSchema);
