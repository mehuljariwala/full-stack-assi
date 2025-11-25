import type { PriceTiers } from "../types/venue";

interface LegendProps {
  priceTiers: PriceTiers;
  showHeatmap: boolean;
}

const STATUS_ITEMS = [
  { status: "available", label: "Available", color: "#22c55e" },
  { status: "reserved", label: "Reserved", color: "#f59e0b" },
  { status: "sold", label: "Sold", color: "#6b7280" },
  { status: "held", label: "Held", color: "#ef4444" },
  { status: "selected", label: "Selected", color: "#3b82f6" },
];

export function Legend({ priceTiers, showHeatmap }: LegendProps) {
  return (
    <div className="legend" role="region" aria-label="Map legend">
      <div className="legend-section">
        <h4>Status</h4>
        <div className="legend-items">
          {STATUS_ITEMS.map(({ status, label, color }) => (
            <div key={status} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="legend-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {showHeatmap && (
        <div className="legend-section">
          <h4>Price Tiers</h4>
          <div className="legend-items">
            {Object.entries(priceTiers).map(([tier, info]) => (
              <div key={tier} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: info.color }}
                  aria-hidden="true"
                />
                <span className="legend-label">
                  {info.label} (${info.price})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
