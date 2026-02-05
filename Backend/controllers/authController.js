const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

/* =========================
   REGISTER (MAGIC LINK)
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

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });

    // 🔐 CREATE MAGIC LINK TOKEN
    const token = jwt.sign(
      { id: user._id, type: "email_verify" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await sendEmail({
      to: email,
      subject: "Verify your TradeXA account",
      html: `
        <h2>Welcome to TradeXA 👋</h2>
        <p>Click the button below to verify your email:</p>
        <a href="${verifyLink}" 
           style="display:inline-block;padding:12px 20px;
                  background:#10b981;color:#fff;
                  border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.status(201).json({
      message: "Verification link sent to your email",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =========================
   VERIFY MAGIC LINK
========================= */
/* =========================
   VERIFY MAGIC LINK (AUTO LOGIN)
========================= */
const verifyEmailLink = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "email_verify") {
      return res.status(400).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    user.isEmailVerified = true;
    await user.save();

    // 🔥 ISSUE LOGIN TOKEN
    const authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Email verified successfully",
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired link" });
  }
};


/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Please verify your email" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
   GET CURRENT USER
========================= */
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  register,
  verifyEmailLink,
  login,
  getMe,
};
