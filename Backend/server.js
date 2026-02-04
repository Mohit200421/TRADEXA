require("dotenv").config();

const express = require("express");
const cors = require("cors");
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
   TRUST PROXY
========================= */
app.set("trust proxy", 1);

/* =========================
   BODY PARSER
========================= */
app.use(express.json());

/* =========================
   🔥 CORS – ALLOW ALL (PRODUCTION SAFE)
========================= */
app.use(
  cors({
    origin: true,
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 FORCE PREFLIGHT SUCCESS
app.options("*", cors());

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
   HEALTH
========================= */
app.get("/", (req, res) => {
  res.send("Trading Journal Backend Running ✅");
});

/* =========================
   SERVER + SOCKET
========================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-channel", (channelId) => {
    socket.join(channelId);
  });

  socket.on("send-message", async (data) => {
    const message = await CommunityMessage.create(data);
    io.to(message.channel).emit("new-message", message);
  });
});

/* =========================
   START
========================= */
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
