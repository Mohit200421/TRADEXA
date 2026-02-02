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
app.set("trust proxy", 1);

/* =========================
   ALLOWED ORIGINS (FIX)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://tradexa-lilac.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") // ✅ allow ALL vercel preview domains
    ) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

/* =========================
   MIDDLEWARES
========================= */
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

/* =========================
   HTTP SERVER
========================= */
const server = http.createServer(app);

/* =========================
   SOCKET.IO (NO EXTRA FILE)
========================= */
const io = new Server(server, {
  cors: corsOptions,
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
  console.log(`🚀 Server running on port ${PORT}`);
});
