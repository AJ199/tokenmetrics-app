// -------------------------------------------
// ✅ Load environment variables
// -------------------------------------------
const path = require("path"); // Must be imported before using
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");
const { fetchIndices, fetchHistory30d } = require("./vendorClient");
const { checkPerMinute, checkPerMonthOrBump } = require("./limits");
const { TTLCache } = require("./cache");

const app = express();
app.use(cors());
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

// ✅ Fetch market indices
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
    console.error("❌ Error in /api/indices:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch 30-day historical data
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
    console.error("❌ Error in /api/history:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Serve frontend build (for production)
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
