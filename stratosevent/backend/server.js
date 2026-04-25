// server.js - StratosEvent Express Application Entry Point
require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const path     = require("path");

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// ── API Routes ────────────────────────────────────────────────
app.use("/api/events",        require("./routes/eventRoutes"));
app.use("/api/registrations", require("./routes/registrationRoutes"));
app.use("/api/attendance",    require("./routes/attendanceRoutes"));
app.use("/api/dashboard",     require("./routes/dashboardRoutes"));

// ── Health Check ──────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "StratosEvent API is running.", timestamp: new Date() })
);

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Endpoint not found." })
);

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 StratosEvent server running at http://localhost:${PORT}`);
});
