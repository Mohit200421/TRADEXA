const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");

const router = express.Router();

/* =========================
   LOCAL MULTER (DEBUG)
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/",
  auth,
  upload.single("image"),
  (req, res) => {
    console.log("🔥 UPLOAD ROUTE HIT");
    console.log("FILE:", req.file);
    console.log("BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({
        message: "No file received",
      });
    }

    res.json({
      success: true,
      file: req.file,
    });
  }
);

module.exports = router;
