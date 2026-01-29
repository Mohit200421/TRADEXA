const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: String,

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
