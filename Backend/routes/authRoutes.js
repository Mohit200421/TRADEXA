const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  register,
  verifyEmail,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

// Register + verify
router.post("/register", register);
router.get("/verify-email", verifyEmail);

// Login / Logout
router.post("/login", login);
router.post("/logout", auth, logout);

// Current user
router.get("/me", auth, getMe);

module.exports = router;
