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

/* =========================
   AUTH ROUTES
========================= */

// Register + Email verify
router.post("/register", register);
router.get("/verify-email", verifyEmail);

// Login / Logout
router.post("/login", login);
router.post("/logout", auth, logout);

// Authenticated user
router.get("/me", auth, getMe);

// Health test
router.get("/test", (req, res) => {
  res.send("Auth routes OK");
});

module.exports = router;
