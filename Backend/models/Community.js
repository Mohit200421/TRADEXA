const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    inviteCode: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", communitySchema);
