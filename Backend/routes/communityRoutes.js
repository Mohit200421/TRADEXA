const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Community = require("../models/Community");
const Channel = require("../models/Channel");
const CommunityMessage = require("../models/CommunityMessage");
const auth = require("../middleware/auth");

/* =========================
   CREATE COMMUNITY
========================= */
router.post("/create", auth, async (req, res) => {
  try {
    const inviteCode = crypto.randomBytes(6).toString("hex");

    const community = await Community.create({
      name: req.body.name,
      description: req.body.description,
      owner: req.user.id,
      members: [req.user.id],
      inviteCode,
    });

    await Channel.create({
      communityId: community._id,
      name: "general",
    });

    res.json(community);
  } catch (err) {
    res.status(500).json({ message: "Failed to create community" });
  }
});

/* =========================
   JOIN COMMUNITY
========================= */
router.post("/join/:inviteCode", auth, async (req, res) => {
  try {
    const community = await Community.findOne({
      inviteCode: req.params.inviteCode,
    });

    if (!community) {
      return res.status(404).json({ message: "Invalid invite link" });
    }

    if (!community.members.includes(req.user.id)) {
      community.members.push(req.user.id);
      await community.save();
    }

    res.json({ success: true, communityId: community._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to join community" });
  }
});

/* =========================
   MY COMMUNITIES
========================= */
router.get("/my", auth, async (req, res) => {
  const communities = await Community.find({
    members: req.user.id,
  }).sort({ createdAt: -1 });

  res.json(communities);
});

/* =========================
   COMMUNITY CHANNELS
========================= */
router.get("/:id/channels", auth, async (req, res) => {
  const channels = await Channel.find({
    communityId: req.params.id,
  });

  res.json(channels);
});

/* =========================
   CHANNEL MESSAGES (FIXED)
========================= */
router.get("/messages/:channel", auth, async (req, res) => {
  try {
    const messages = await CommunityMessage.find({
      channel: req.params.channel, // ✅ FIX
      parentId: null,
    })
      .sort({ createdAt: 1 })
      .limit(200);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages" });
  }
});

/* =========================
   THREAD REPLIES
========================= */
router.get("/thread/:parentId", auth, async (req, res) => {
  try {
    const replies = await CommunityMessage.find({
      parentId: req.params.parentId,
    }).sort({ createdAt: 1 });

    res.json(replies);
  } catch (err) {
    res.status(500).json({ message: "Failed to load thread replies" });
  }
});

module.exports = router;
