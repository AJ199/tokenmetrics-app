import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

export default function ThirtyDayChart({ points }) {
  const labels = points.map((p) => new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  const data = {
    labels,
    datasets: [
      {
        label: "Closing Price (USD)",
        data: points.map((p) => p.close),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `Price: $${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#555", font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: {
          color: "#555",
          font: { size: 10 },
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div style={{ height: 350, width: "100%", marginTop: "1rem" }}>
      <Line data={data} options={options} />
    </div>
  );
}
