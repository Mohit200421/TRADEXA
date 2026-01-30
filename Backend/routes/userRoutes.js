const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  updateProfilePhoto,
  updateProfile,          // ✅ FIX: IMPORT ADDED
} = require("../controllers/userController");

/* =========================
   PROFILE ROUTES
========================= */

// Upload / update profile photo
router.put(
  "/profile-photo",
  auth,
  upload.single("avatar"),
  updateProfilePhoto
);

// Update profile (name)
router.put("/profile", auth, updateProfile);

module.exports = router;
