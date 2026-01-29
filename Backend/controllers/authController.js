const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

/* =========================
   REGISTER + SEND VERIFY MAIL
========================= */
exports.register = async (req, res) => {
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

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerifyToken: verifyToken,
      emailVerifyExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    // 🔥 DIRECT BACKEND VERIFY LINK
    const verifyLink = `http://localhost:5000/api/auth/verify-email?token=${verifyToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your TradeFX account",
      html: `
        <h2>Welcome to TradeFX</h2>
        <p>Please verify your email:</p>
        <a href="${verifyLink}">Verify Email</a>
      `,
    });

    res.status(201).json({
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
exports.verifyEmail = async (req, res) => {
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

    // ✅ SIMPLE RESPONSE
    res.send("Email verified successfully. You can close this tab and login.");
  } catch (err) {
    res.status(500).send("Verification failed");
  }
};

/* =========================
   LOGIN
========================= */
exports.login = async (req, res) => {
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ✅ LOCAL SAFE
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   LOGOUT (FIXED BUG)
========================= */
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({ message: "Logged out successfully" });
};

/* =========================
   GET CURRENT USER
========================= */
exports.getMe = async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
};
