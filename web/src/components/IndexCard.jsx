export default function IndexCard({ item, onSelect }) {
  return (
    <button
      onClick={() => onSelect(item.symbol)}
      style={{
        padding: 12,
        textAlign: "left",
        borderRadius: 12,
        border: "1px solid #ccc",
        background: "#fff",
        width: "100%",
      }}
    >
      <div style={{ fontWeight: "bold" }}>{item.symbol} — {item.name}</div>
      <div style={{ fontSize: 14 }}>
        {item.price}{" "}
        <span style={{ color: item.changesPercentage >= 0 ? "green" : "crimson" }}>
          ({item.changesPercentage.toFixed(2)}%)
        </span>
      </div>
    </button>
  );
}
