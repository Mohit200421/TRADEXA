const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { emailOTPTemplate } = require("../utils/emailTemplates");

/* =========================
   REGISTER (OTP BASED)
========================= */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER WITH EMAIL VERIFIED (SKIP OTP)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: true,
    });

    // ✅ RESPOND IMMEDIATELY
    res.status(201).json({
      message: "Account created successfully. Please login.",
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =========================
   VERIFY EMAIL OTP
========================= */
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.emailOTP !== otp || user.emailOTPExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isEmailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   LOGOUT
========================= */
const logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

/* =========================
   GET CURRENT USER
========================= */
const getMe = async (req, res) => {
  res.json(req.user);
};

/* =========================
   RESEND EMAIL OTP
========================= */
const resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.isEmailVerified) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailOTP = otp;
    user.emailOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: "Your new TradeXA OTP",
      html: emailOTPTemplate(otp),
    });

    res.json({ message: "OTP resent successfully" });
  } catch {
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

module.exports = {
  register,
  verifyEmailOTP,
  resendEmailOTP,
  login,
  logout,
  getMe,
};
