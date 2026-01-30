const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: String,

    // 🧑 Profile photo
    avatar: {
      type: String,
      default: "/avatar.jpg", // ✅ default profile image
    },

    // 🔐 Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: String,
    emailVerifyExpiry: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
