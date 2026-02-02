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
    console.log("Registration attempt for email:", email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("User already exists for email:", email);
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔐 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP for", email, ":", otp);

    await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      emailOTP: otp,
      emailOTPExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    console.log("User created, sending email to:", email);
    await sendEmail({
      to: email,
      subject: "Verify your TradeFX account",
      html: `<p>Your OTP is <b>${otp}</b></p><p>Expires in 10 minutes</p>`,
    });

    console.log("Registration successful for:", email);
    res.json({
      message: "Registered successfully. OTP sent to email.",
    });
  } catch (err) {
    console.error("Registration error:", err);
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

    const user = await User.findOne({
      email,
      emailOTP: otp,
      emailOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;

    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  try {
    console.log("Login attempt for email:", req.body.email);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("User found, email verified:", user.isEmailVerified);

    // TEMPORARY: Bypass email verification for debugging
    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     message: "Please verify your email first",
    //   });
    // }

    const match = await bcrypt.compare(password, user.password);
    console.log("Password match result:", match);

    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Login successful for user:", user.email);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
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
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
};

/* =========================
   RESEND EMAIL OTP
========================= */
const resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // 🔐 Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailOTP = otp;
    user.emailOTPExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendEmail({
      to: email,
      subject: "Your new TradeFX OTP",
      html: emailOTPTemplate(otp),
    });

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

module.exports = {
  register,
  verifyEmailOTP,
  resendEmailOTP, // ✅ add
  login,
  logout,
  getMe,
};
