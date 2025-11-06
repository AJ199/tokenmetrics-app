// web/src/api.js

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

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
