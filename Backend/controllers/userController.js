const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const streamifier = require("streamifier");

// 🔐 UPDATE PROFILE PHOTO
exports.updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "tradefx/avatars",
        resource_type: "image",
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        const user = await User.findByIdAndUpdate(
          req.userId,
          { avatar: result.secure_url },
          { new: true }
        ).select("-password");

        res.json(user); // 🔥 return updated user
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    res.status(500).json({ message: "Profile photo update failed" });
  }
};

// ✏️ UPDATE PROFILE (NAME)
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: "Invalid name" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Profile update failed" });
  }
};
