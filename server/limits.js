// server/limits.js
const { readMonthlyCounter, writeMonthlyCounter, currentMonthKey } = require("./cache");

// ------------------------------
// Token Bucket for Per-Minute Rate Limit
// ------------------------------
class TokenBucket {
  constructor(ratePerMinute) {
    this.capacity = ratePerMinute; // max tokens
    this.tokens = ratePerMinute;   // start full
    this.refillRate = ratePerMinute / 60; // tokens per second
    this.timestamp = Date.now();
  }

  // Try to take 1 token (return true if allowed)
  take(cost = 1) {
    const now = Date.now();
    const elapsed = (now - this.timestamp) / 1000;
    this.timestamp = now;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }
}

const bucket = new TokenBucket(20); // 20 requests per minute limit

// Check per-minute limit
function checkPerMinute() {
  return bucket.take(1);
}

// Check monthly limit and increment
function checkPerMonthOrBump() {
  const cap = 500; // monthly cap
  const data = readMonthlyCounter();
  const cur = currentMonthKey();

  // Reset if new month
  if (data.month !== cur) {
    data.month = cur;
    data.count = 0;
  }

  if (data.count >= cap) return { ok: false, remaining: 0 };

  data.count += 1;
  writeMonthlyCounter(data);
  return { ok: true, remaining: cap - data.count };
}

module.exports = { checkPerMinute, checkPerMonthOrBump };
