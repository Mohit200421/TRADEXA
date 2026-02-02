const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);
