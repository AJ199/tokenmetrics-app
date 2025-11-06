import React, { useEffect, useState } from "react";
import { getIndices, getHistory } from "./api";
import IndexCard from "./components/IndexCard";
import ThirtyDayChart from "./components/ThirtyDayChart";

export default function App() {
  const [indices, setIndices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch indices initially
  const loadIndices = async () => {
    try {
      setLoading(true);
      const res = await getIndices();
      setIndices(res.data);
      setCached(res.source === "cache");
    } catch (err) {
      console.error(err);
      setError("Failed to load indices.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch 30-day history for selected symbol
  const loadHistory = async (symbol) => {
    try {
      setSelected(symbol);
      setLoading(true);
      const res = await getHistory(symbol);
      const points = res.data.historical.slice(0, 30).reverse();
      setHistory(points);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load 30-day data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadIndices();
  }, []);

  // WebSocket live updates
  useEffect(() => {
    const ws = new WebSocket(
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/ws`
    );
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "indices" && msg.data?.data) {
          setIndices(msg.data.data);
          setCached(msg.data.source === "cache");
        }
      } catch {
        console.warn("Malformed WS message ignored");
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, textAlign: "center" }}>
      <h1 style={{ marginBottom: "1rem" }}>Market Indices & Crypto Overview</h1>

      {cached && <p style={{ color: "gray" }}>💾 Cached data (auto-refreshes every 60–120s)</p>}
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "12px",
          marginTop: "1rem",
        }}
      >
        {indices.map((item) => (
          <IndexCard key={item.symbol} item={item} onSelect={loadHistory} />
        ))}
      </div>

      <div style={{ marginTop: 40 }}>
        {selected && history ? (
          <>
            <h3>{selected} — 30-Day Chart</h3>
            <ThirtyDayChart points={history} />
          </>
        ) : (
          <p>Select a symbol to view 30-day detail.</p>
        )}
      </div>
    </div>
  );
}
