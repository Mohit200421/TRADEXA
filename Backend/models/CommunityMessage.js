const mongoose = require("mongoose");

const communityMessageSchema = new mongoose.Schema(
  {
    /* =====================
       CHANNEL INFO
    ===================== */
    channel: {
      type: String,
      required: true,
      index: true,
    },

    /* =====================
       THREAD SUPPORT (🔥 NEW)
    ===================== */
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityMessage",
      default: null, // null = normal message, not a reply
      index: true,
    },

    /* =====================
       MESSAGE TYPE
    ===================== */
    type: {
      type: String,
      enum: ["text", "trade", "image", "file"],
      required: true,
    },

    /* =====================
       USER INFO
    ===================== */
    user: {
      type: String, // later can be ObjectId
      required: true,
    },

    avatar: String,

    /* =====================
       TEXT MESSAGE
    ===================== */
    text: String,

    /* =====================
       TRADE IDEA
    ===================== */
    symbol: String,
    side: {
      type: String,
      enum: ["LONG", "SHORT"],
    },
    entry: String,
    sl: String,
    tp: String,

    /* =====================
       MEDIA (CLOUDINARY)
    ===================== */
    imageUrl: String,
    fileUrl: String,
    fileName: String,

    /* =====================
       REACTIONS
    ===================== */
    reactions: {
      type: Map,
      of: [String], // emoji -> array of userIds
      default: {},
    },

    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },
    
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true,
    },
    

    /* =====================
       UI TIME (OPTIONAL)
    ===================== */
    time: String,
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model(
  "CommunityMessage",
  communityMessageSchema
);
