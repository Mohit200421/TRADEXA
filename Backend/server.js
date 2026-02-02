require("dotenv").config();
console.log("Environment variables loaded:");
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

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
   ALLOWED ORIGINS
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://tradexa-lilac.vercel.app",
  "https://tradexa-o20hs81uv-mohit200421s-projects.vercel.app",
  "https://tradexa-1jkcgatup-mohit200421s-projects.vercel.app",
];

/* =========================
   CORS (REST API)
========================= */
app.use(
  cors({
    origin(origin, callback) {
      // allow server-to-server, Postman, curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked"));
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
   HTTP SERVER
========================= */
const server = http.createServer(app);

/* =========================
   SOCKET.IO
========================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id);

  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
  });

  socket.on("send-message", async (data) => {
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
          ? users.filter((u) => u !== user)
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
  console.log(
    "Health check called from:",
    req.headers.origin || "unknown origin"
  );
  res.send("Trading Journal Backend Running ✅");
});

/* =========================
   TEST LOGIN ENDPOINT
========================= */
app.post("/api/auth/test-login", (req, res) => {
  console.log("Test login endpoint called with body:", req.body);
  console.log("Headers:", req.headers);
  res.json({ message: "Test login endpoint working", received: req.body });
});

/* =========================
   DATABASE + SERVER
========================= */
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
