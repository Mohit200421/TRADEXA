const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts[0] === "Bearer" && parts[1]) {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIX: normalize user object
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
