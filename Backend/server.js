require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const connectDB = require("./config/db");

const app = express();

/* ---------- Middleware ---------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",              // local frontend
      "https://trade-fx-flax.vercel.app"    // deployed frontend
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

/* ---------- Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* ---------- Health ---------- */
app.get("/", (req, res) => {
  res.send("Trading Journal Backend Running ✅");
});

/* ---------- DB ---------- */
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
