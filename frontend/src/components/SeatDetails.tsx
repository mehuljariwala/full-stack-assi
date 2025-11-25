import { useMemo } from "react";
import type { FlattenedSeat, PriceTiers, SeatStatus } from "../types/venue";

interface SeatDetailsProps {
  seatId: string | null;
  seats: FlattenedSeat[];
  priceTiers: PriceTiers;
  isSelected: boolean;
}

const STATUS_LABELS: Record<SeatStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "#22c55e" },
  reserved: { label: "Reserved", color: "#f59e0b" },
  sold: { label: "Sold", color: "#6b7280" },
  held: { label: "Held", color: "#ef4444" },
};

export function SeatDetails({
  seatId,
  seats,
  priceTiers,
  isSelected,
}: SeatDetailsProps) {
  const seatData = useMemo(() => {
    if (!seatId) return null;
    return seats.find((s) => s.id === seatId) ?? null;
  }, [seatId, seats]);

  const priceTier = useMemo(() => {
    if (!seatData) return null;
    return priceTiers[seatData.priceTier.toString()] ?? null;
  }, [seatData, priceTiers]);

  if (!seatData || !priceTier) {
    return (
      <div className="seat-details empty">
        <p>Hover or focus on a seat to see details</p>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[seatData.status];

  return (
    <div className="seat-details" role="region" aria-live="polite">
      <h3>Seat Details</h3>
      <div className="details-grid">
        <div className="detail-row">
          <span className="detail-label">Seat ID:</span>
          <span className="detail-value">{seatData.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Section:</span>
          <span className="detail-value">{seatData.sectionLabel}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Row:</span>
          <span className="detail-value">{seatData.rowIndex}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Seat:</span>
          <span className="detail-value">{seatData.col}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Price Tier:</span>
          <span className="detail-value" style={{ color: priceTier.color }}>
            {priceTier.label}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Price:</span>
          <span className="detail-value price">${priceTier.price}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span
            className="detail-value status-badge"
            style={{ backgroundColor: statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        </div>
        {isSelected && (
          <div className="selected-indicator">
            <span className="checkmark">✓</span> Selected
          </div>
        )}
      </div>
    </div>
  );
}
