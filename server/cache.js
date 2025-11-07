// server/cache.js
const fs = require("fs");
const path = require("path");

// ------------------------------
// TTL In-Memory Cache
// ------------------------------
class TTLCache {
  constructor(defaultTtlSec = 90) {
    this.ttl = defaultTtlSec * 1000; // convert to ms
    this.map = new Map();
  }

  // Get value if still valid
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.map.delete(key);
      return null;
    }
    return entry.value;
  }

  // Set value with expiration
  set(key, value, ttlMs = this.ttl) {
    this.map.set(key, { value, expires: Date.now() + ttlMs });
  }
}

// ------------------------------
// Monthly API Counter
// ------------------------------
const monthlyFile = path.join(__dirname, "monthlyCounter.json");

// Current month key e.g. "2025-11"
function currentMonthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Read or init monthly counter
function readMonthlyCounter() {
  try {
    const raw = fs.readFileSync(monthlyFile, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { month: currentMonthKey(), count: 0 };
  }
}

// Write updated counter
function writeMonthlyCounter(obj) {
  fs.writeFileSync(monthlyFile, JSON.stringify(obj, null, 2));
}

module.exports = {
  TTLCache,
  readMonthlyCounter,
  writeMonthlyCounter,
  currentMonthKey,
};
