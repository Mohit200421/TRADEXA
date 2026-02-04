const TraderProfile = require("../models/TraderProfile");

/**
 * GET /api/profile/me
 * Get logged-in user's profile
 */
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await TraderProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(200).json(null); // ✅ do not throw 404
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/profile
 * Create profile (one-time only)
 */
exports.createProfile = async (req, res) => {
  try {
    const existingProfile = await TraderProfile.findOne({
      userId: req.user.id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists",
      });
    }

    const profile = await TraderProfile.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json(profile);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/profile
 * Update logged-in user's profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const profile = await TraderProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json(profile);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username already taken",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};
