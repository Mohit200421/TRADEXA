const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  register,
  verifyEmailOTP,
  resendEmailOTP,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

/* =========================
   AUTH ROUTES
========================= */

// Register + OTP verification
router.post("/register", register);
router.post("/verify-email-otp", verifyEmailOTP);
router.post("/resend-email-otp", resendEmailOTP);

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
