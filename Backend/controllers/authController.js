const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

/* =========================
   REGISTER
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
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerifyToken: verifyToken,
      emailVerifyExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your TradeFX account",
      html: `<a href="${verifyLink}">Verify Email</a>`,
    });

    res.json({
      message: "Registered successfully. Please verify your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =========================
   VERIFY EMAIL
========================= */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired verification link");
    }

    user.isEmailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpiry = undefined;
    await user.save();

    res.send("Email verified successfully. You can login.");
  } catch (err) {
    res.status(500).send("Verification failed");
  }
};

/* =========================
   LOGIN  (🔥 COOKIE REMOVED)
========================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 NO COOKIE — PURE TOKEN
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   LOGOUT
========================= */
const logout = async (req, res) => {
  // token frontend वर delete होतो
  res.json({ message: "Logged out successfully" });
};

/* =========================
   GET CURRENT USER
========================= */
const getMe = async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  getMe,
};
