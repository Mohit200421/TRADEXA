const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  uploadAvatar,
} = require("../controllers/profileAvatarController");

router.put("/avatar", auth, upload.single("avatar"), uploadAvatar);


module.exports = router;
