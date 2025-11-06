const fetch = require("node-fetch");

const BASE = process.env.VENDOR_API_URL || "https://financialmodelingprep.com/api/v3";
const KEY = process.env.VENDOR_API_KEY || "demo";

// 🔹 Safe fetch with error handling
async function safeFetch(url, label) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${label} failed with status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`❌ [${label}] Fetch error:`, err.message);
    return null; // fallback handled later
  }
}

// 🔹 Fetch multiple indices (S&P 500, NASDAQ, BTC, ETH)
async function fetchIndices(symbols = ["^GSPC", "^IXIC", "BTCUSD", "ETHUSD"]) {
  const joined = symbols.map(encodeURIComponent).join(",");
  const url = `${BASE}/quote/${joined}?apikey=${KEY}`;
  console.log(`[fetchIndices] Requesting: ${url}`);

  const data = await safeFetch(url, "Indices");
  if (data && Array.isArray(data)) return data;

  // fallback mock data
  console.warn("⚠️ Returning fallback indices data");
  return [
    { symbol: "^GSPC", name: "S&P 500", price: 5230.54, changesPercentage: 0.45 },
    { symbol: "^IXIC", name: "NASDAQ", price: 16840.21, changesPercentage: -0.21 },
    { symbol: "BTCUSD", name: "Bitcoin", price: 68400.55, changesPercentage: 1.2 },
    { symbol: "ETHUSD", name: "Ethereum", price: 3850.87, changesPercentage: -0.8 },
  ];
}

// 🔹 Fetch 30-day historical data
async function fetchHistory30d(symbol) {
  const url = `${BASE}/historical-price-full/${encodeURIComponent(symbol)}?timeseries=30&apikey=${KEY}`;
  console.log(`[fetchHistory30d] Requesting: ${url}`);

  const data = await safeFetch(url, `History for ${symbol}`);
  if (data && data.historical) return data;

  // fallback mock data
  console.warn(`⚠️ Returning fallback history data for ${symbol}`);
  const now = Date.now();
  const fake = Array.from({ length: 30 }).map((_, i) => ({
    date: new Date(now - i * 86400000).toISOString().split("T")[0],
    close: 5000 + Math.random() * 100,
  }));
  return { symbol, historical: fake };
}

module.exports = { fetchIndices, fetchHistory30d };
