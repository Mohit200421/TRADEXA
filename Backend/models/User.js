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
      default: "/avatar.jpg",
    },

    // 🔐 Email verification (OTP based)
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailOTP: {
      type: String,
    },

    emailOTPExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
