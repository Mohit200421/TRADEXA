const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  register,
  verifyEmailLink,
  login,
  getMe,
} = require("../controllers/authController");

router.post("/register", register);
router.get("/verify-email", verifyEmailLink);
router.post("/login", login);

// ✅ used by frontend
router.get("/me", auth, getMe);

router.get("/test", (req, res) => {
  res.send("Auth routes OK");
});

module.exports = router;
