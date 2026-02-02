const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    console.log("Auth middleware called for:", req.path);
    const authHeader = req.headers.authorization;
    console.log("Auth header present:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No auth header or doesn't start with Bearer");
      return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extracted, verifying...");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified successfully, userId:", decoded.userId);

    // ✅ ONLY store what actually exists in JWT
    req.user = {
      id: decoded.userId,
    };

    next();
  } catch (err) {
    console.log("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
