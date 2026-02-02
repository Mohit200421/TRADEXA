require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
const profileAvatarRoutes = require("./routes/profileAvatarRoutes");
const communityRoutes = require("./routes/communityRoutes");

const CommunityMessage = require("./models/CommunityMessage");
const connectDB = require("./config/db");

const app = express();

/* =========================
   TRUST PROXY (RENDER)
========================= */
app.set("trust proxy", 1);

/* =========================
   HTTP SERVER
========================= */
const server = http.createServer(app);

/* =========================
   CORS CONFIG (FIXED)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://tradexa-lilac.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   MIDDLEWARES
========================= */
app.use(express.json());
app.use(cookieParser());

/* =========================
   SOCKET.IO (FIXED)
========================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", socket => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-channel", channelId => {
    socket.join(channelId);
  });

  socket.on("send-message", async data => {
    try {
      const message = await CommunityMessage.create(data);
      io.to(message.channel).emit("new-message", message);
    } catch (err) {
      console.error("❌ Message save failed:", err);
    }
  });

  socket.on("toggle-reaction", async ({ messageId, emoji, user }) => {
    try {
      const message = await CommunityMessage.findById(messageId);
      if (!message) return;

      const users = message.reactions.get(emoji) || [];

      message.reactions.set(
        emoji,
        users.includes(user)
          ? users.filter(u => u !== user)
          : [...users, user]
      );

      await message.save();

      io.to(message.channel).emit("reaction-updated", {
        messageId,
        reactions: Object.fromEntries(message.reactions),
      });
    } catch (err) {
      console.error("❌ Reaction update failed:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/profile", profileAvatarRoutes);
app.use("/api/community", communityRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Trading Journal Backend Running ✅");
});

/* =========================
   START SERVER
========================= */
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
