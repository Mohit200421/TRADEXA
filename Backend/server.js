require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const tradeRoutes = require("./routes/tradeRoutes");



const connectDB = require("./config/db");

const app = express();


// Middleware
app.use(cors({ origin: ["http://localhost:5173", "https://YOUR-VERCEL-URL.vercel.app"]
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/trades", tradeRoutes);



// DB Connect
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Trading Journal Backend Running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
