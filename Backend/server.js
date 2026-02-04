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
   TRUST PROXY (RENDER)
========================= */
app.set("trust proxy", 1);

/* =========================
   MIDDLEWARES
========================= */
app.use(express.json());

/* =========================
   ✅ CORS (FIXED FOR VERCEL)
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tradexa-lilac.vercel.app",
      "https://tradexa-djz3cn5qc-mohit200421s-projects.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
   HTTP + SOCKET.IO
========================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://tradexa-lilac.vercel.app",
      "https://tradexa-djz3cn5qc-mohit200421s-projects.vercel.app",
    ],
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

  socket.on("disconnect", () => {});
});

/* =========================
   DB + START
========================= */
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
