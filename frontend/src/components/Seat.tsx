import { memo, useCallback } from "react";
import type { FlattenedSeat, PriceTier, SeatStatus } from "../types/venue";

interface SeatProps {
  seat: FlattenedSeat;
  priceTier: PriceTier;
  isSelected: boolean;
  isFocused: boolean;
  showHeatmap: boolean;
  onSelect: (seatId: string) => void;
  onFocus: (seatId: string | null) => void;
  canSelectMore: boolean;
}

// Color configurations for different seat states
const STATUS_COLORS: Record<SeatStatus, { fill: string; stroke: string }> = {
  available: { fill: "#22c55e", stroke: "#16a34a" },
  reserved: { fill: "#f59e0b", stroke: "#d97706" },
  sold: { fill: "#6b7280", stroke: "#4b5563" },
  held: { fill: "#ef4444", stroke: "#dc2626" },
};

const SEAT_RADIUS = 10;

function SeatComponent({
  seat,
  priceTier,
  isSelected,
  isFocused,
  showHeatmap,
  onSelect,
  onFocus,
  canSelectMore,
}: SeatProps) {
  const isInteractive = seat.status === "available";
  const canInteract = isInteractive && (isSelected || canSelectMore);

  const handleClick = useCallback(() => {
    if (canInteract) {
      onSelect(seat.id);
    }
  }, [canInteract, onSelect, seat.id]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && canInteract) {
        e.preventDefault();
        onSelect(seat.id);
      }
    },
    [canInteract, onSelect, seat.id]
  );

  const handleFocus = useCallback(() => {
    onFocus(seat.id);
  }, [onFocus, seat.id]);

  const handleBlur = useCallback(() => {
    onFocus(null);
  }, [onFocus]);

  // Determine fill color based on state
  let fillColor: string;
  let strokeColor: string;

  if (isSelected) {
    fillColor = "#3b82f6";
    strokeColor = "#1d4ed8";
  } else if (showHeatmap && isInteractive) {
    fillColor = priceTier.color;
    strokeColor = priceTier.color;
  } else {
    const colors = STATUS_COLORS[seat.status];
    fillColor = colors.fill;
    strokeColor = colors.stroke;
  }

  // Create aria-label for accessibility
  const ariaLabel = `Seat ${seat.id}, Section ${seat.sectionLabel}, Row ${
    seat.rowIndex
  }, Column ${seat.col}, ${priceTier.label} tier, $${priceTier.price}, ${
    seat.status
  }${isSelected ? ", selected" : ""}`;

  return (
    <g
      role="button"
      tabIndex={isInteractive ? 0 : -1}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-disabled={!canInteract}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{
        cursor: canInteract
          ? "pointer"
          : seat.status === "available"
          ? "not-allowed"
          : "default",
        outline: "none",
      }}
    >
      <circle
        cx={seat.x}
        cy={seat.y}
        r={SEAT_RADIUS}
        fill={fillColor}
        stroke={isFocused ? "#fff" : strokeColor}
        strokeWidth={isFocused ? 3 : 1.5}
        opacity={isInteractive ? 1 : 0.6}
      />
      {/* Selection indicator */}
      {isSelected && (
        <circle
          cx={seat.x}
          cy={seat.y}
          r={SEAT_RADIUS + 3}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}
      {/* Focus ring for keyboard navigation */}
      {isFocused && (
        <circle
          cx={seat.x}
          cy={seat.y}
          r={SEAT_RADIUS + 5}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={2}
        />
      )}
    </g>
  );
}

// Memoize to prevent unnecessary re-renders for large seat counts
export const Seat = memo(SeatComponent, (prevProps, nextProps) => {
  return (
    prevProps.seat.id === nextProps.seat.id &&
    prevProps.seat.status === nextProps.seat.status &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isFocused === nextProps.isFocused &&
    prevProps.showHeatmap === nextProps.showHeatmap &&
    prevProps.canSelectMore === nextProps.canSelectMore &&
    prevProps.priceTier.price === nextProps.priceTier.price
  );
});

Seat.displayName = "Seat";
