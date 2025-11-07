// -------------------------------------------
// Load environment variables
// -------------------------------------------
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const { fetchIndices, fetchHistory30d } = require("./vendorClient");
const { checkPerMinute, checkPerMonthOrBump } = require("./limits");
const { TTLCache } = require("./cache");

const app = express();

// -------------------------------------------
// CORS (Vercel + Local Dev)
// -------------------------------------------
const allowedOrigins = [
  "https://tokenmetrics-app.vercel.app",
  "http://localhost:5173"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no origin (like server-to-server) or whitelisted ones
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked CORS from:", origin);
        callback(new Error("CORS not allowed for this origin"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors()); // Preflight support
app.use(express.json());

// -------------------------------------------
// Configuration
// -------------------------------------------
const PORT = process.env.PORT || 8080;
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || "90");
const SYMBOLS = process.env.INDICES_SYMBOLS
  ? process.env.INDICES_SYMBOLS.split(",")
  : ["^GSPC", "^IXIC", "BTCUSD", "ETHUSD"];

// -------------------------------------------
// Initialize Cache
// -------------------------------------------
const cache = new TTLCache(CACHE_TTL);

// -------------------------------------------
// Routes
// -------------------------------------------

// Quick health check route
app.get("/api/ping", (req, res) => res.json({ status: "ok" }));

// Market indices
app.get("/api/indices", async (req, res) => {
  try {
    const cacheKey = "indices";
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: "cache", data: cached });

    if (!checkPerMinute())
      return res.status(429).json({ error: "Per-minute API limit reached" });

    const monthCheck = checkPerMonthOrBump();
    if (!monthCheck.ok)
      return res.status(429).json({ error: "Monthly API limit exceeded" });
    
// Fetch from vendor API
    const data = await fetchIndices(SYMBOLS);
    cache.set(cacheKey, data);
    res.json({ source: "live", data });
  } catch (err) {
    console.error("Error in /api/indices:", err);
    res.status(500).json({ error: err.message });
  }
});

// 30-day history
app.get("/api/history/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `history_${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ source: "cache", data: cached });

    if (!checkPerMinute())
      return res.status(429).json({ error: "Per-minute API limit reached" });

    const monthCheck = checkPerMonthOrBump();
    if (!monthCheck.ok)
      return res.status(429).json({ error: "Monthly API limit exceeded" });

    const data = await fetchHistory30d(symbol);
    cache.set(cacheKey, data);
    res.json({ source: "live", data });
  } catch (err) {
    console.error("Error in /api/history:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------
// Serve Frontend
// -------------------------------------------
if (process.env.NODE_ENV === "production") {
  const webPath = path.join(__dirname, "../web/dist");
  app.use(express.static(webPath));
  app.get("*", (_, res) => res.sendFile(path.join(webPath, "index.html")));
}

// -------------------------------------------
// Start Server
// -------------------------------------------
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
