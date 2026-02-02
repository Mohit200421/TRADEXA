const cloudinary = require("../config/cloudinary");
const TraderProfile = require("../models/TraderProfile");
const streamifier = require("streamifier");

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const profile = await TraderProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Delete old avatar if exists
    if (profile.avatar?.publicId) {
      await cloudinary.uploader.destroy(profile.avatar.publicId);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "tradexa/avatars",
        transformation: [
          { width: 300, height: 300, crop: "fill", gravity: "face" },
        ],
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        profile.avatar = {
          url: result.secure_url,
          publicId: result.public_id,
        };

        await profile.save();
        return res.json(profile.avatar);
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
