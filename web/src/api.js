// web/src/api.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://tokenmetrics-app.onrender.com/api";

console.log("🔍 API Base URL (runtime):", API_BASE);

export async function getIndices(symbols) {
  const qs = symbols ? `?symbols=${symbols.join(",")}` : "";
  const r = await fetch(`${API_BASE}/indices${qs}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getHistory(symbol) {
  const r = await fetch(`${API_BASE}/history/${symbol}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
