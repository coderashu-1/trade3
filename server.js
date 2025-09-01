require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const { authorizeAdmin } = require("./middleware/authorizeAdmin"); // ✅ your existing middleware

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const db = process.env.mongoURI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// API Routes
app.use("/api/user", require("./api/user"));
app.use("/api/stocks", require("./api/stocks"));
app.use("/api/authorize", require("./api/authorize"));
app.use("/api/iex", require("./api/iex"));
app.use("/api/email", require("./api/email"));
app.use("/api/transactions", require("./api/transactions"));

// ✅ Middleware to protect file access via token query
function authorizeAdminFile(req, res, next) {
  const token = req.query.token;
  if (!token) return res.status(401).json({ msg: "No token. Authorization denied." });

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    if (!decoded.isAdmin) return res.status(403).json({ msg: "Admin access only" });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token is not valid." });
  }
}

app.use("/static", express.static(path.join(__dirname, "static")));

// ✅ Protected route for deposit screenshots (admins only)
app.get("/uploads/:filename", authorizeAdminFile, (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).json({ msg: "File not found" });
    res.sendFile(filePath);
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));

  // Handle SPA routing
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// Start server
const PORT = process.env.PORT || 5051;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
