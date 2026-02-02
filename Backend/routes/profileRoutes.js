const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  getMyProfile,
  createProfile,
  updateProfile,
} = require("../controllers/profileController");

/**
 * @route   GET /api/profile/me
 * @desc    Get logged-in user's profile
 * @access  Private
 */
router.get("/me", auth, getMyProfile);

/**
 * @route   POST /api/profile
 * @desc    Create trader profile (one-time)
 * @access  Private
 */
router.post("/", auth, createProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update trader profile
 * @access  Private
 */
router.put("/", auth, updateProfile);

module.exports = router;
