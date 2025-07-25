require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4714;

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const facebookAuth = require("./routes/facebookAuth");
const facebookWebhook = require("./routes/facebookWebhook");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const protectedRoutes = require("./routes/protectedRoutes");

// ✅ CORS Settings
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://facebook-helpdesk-jzrv.vercel.app",
    ],
    credentials: true,
  })
);
app.options("*", cors());

app.use(express.json());

// ✅ MongoDB Connection + Session
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.use(
      session({
        secret: process.env.SESSION_SECRET || "defaultSecret123",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
      })
    );

    // ✅ Mount Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/auth", facebookAuth);
    app.use("/api", facebookWebhook); // Facebook requires /webhook at root
    app.use("/api/users", userRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api", protectedRoutes); // optional

    // ✅ Health Check
    app.get("/", (req, res) => {
      res.send("Hello from Facebook Helpdesk backend!");
    });

    // ✅ Start Server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
