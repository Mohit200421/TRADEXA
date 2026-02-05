const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔒 No token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // 🔑 Extract token
    const token = authHeader.split(" ")[1];

    // 🔐 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ SUPPORT BOTH id and userId (BACKWARD + FORWARD SAFE)
    const userId = decoded?.id || decoded?.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Invalid token payload" });
    }

    // 👤 Fetch user
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach user to request
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res
      .status(401)
      .json({ message: "Token invalid or expired" });
  }
};
