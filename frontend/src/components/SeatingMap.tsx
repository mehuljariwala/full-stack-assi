import { useRef, useState, useCallback, useMemo } from "react";
import { Seat } from "./Seat";
import type { FlattenedSeat, PriceTiers, MapDimensions } from "../types/venue";

interface SeatingMapProps {
  seats: FlattenedSeat[];
  priceTiers: PriceTiers;
  mapDimensions: MapDimensions;
  selectedSeatIds: Set<string>;
  focusedSeatId: string | null;
  showHeatmap: boolean;
  canSelectMore: boolean;
  onSelectSeat: (seatId: string) => void;
  onFocusSeat: (seatId: string | null) => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export function SeatingMap({
  seats,
  priceTiers,
  mapDimensions,
  selectedSeatIds,
  focusedSeatId,
  showHeatmap,
  canSelectMore,
  onSelectSeat,
  onFocusSeat,
}: SeatingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta)));
  }, []);

  // Handle pan start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Left click only
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  // Handle pan move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        setPan({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset view
  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(MAX_ZOOM, prev + 0.25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(MIN_ZOOM, prev - 0.25));
  }, []);

  // Default price tier for missing tiers
  const defaultPriceTier = useMemo(
    () => ({ price: 0, label: "Unknown", color: "#666" }),
    []
  );

  // Get price tier safely
  const getPriceTier = useCallback(
    (tierId: number) => {
      return priceTiers[tierId.toString()] ?? defaultPriceTier;
    },
    [priceTiers, defaultPriceTier]
  );

  return (
    <div className="seating-map-container">
      {/* Zoom controls */}
      <div className="zoom-controls">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="zoom-btn"
          disabled={zoom >= MAX_ZOOM}
        >
          +
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="zoom-btn"
          disabled={zoom <= MIN_ZOOM}
        >
          −
        </button>
        <button
          onClick={handleResetView}
          aria-label="Reset view"
          className="zoom-btn reset-btn"
        >
          ↺
        </button>
      </div>

      {/* Map container */}
      <div
        ref={containerRef}
        className="map-viewport"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <svg
          width={mapDimensions.width}
          height={mapDimensions.height}
          viewBox={`0 0 ${mapDimensions.width} ${mapDimensions.height}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
          role="img"
          aria-label="Venue seating map"
        >
          {/* Background */}
          <rect
            x={0}
            y={0}
            width={mapDimensions.width}
            height={mapDimensions.height}
            fill="var(--map-bg, #1a1a2e)"
            rx={8}
          />

          {/* Stage indicator */}
          <rect
            x={mapDimensions.width / 2 - 150}
            y={20}
            width={300}
            height={50}
            fill="var(--stage-color, #374151)"
            rx={4}
          />
          <text
            x={mapDimensions.width / 2}
            y={50}
            textAnchor="middle"
            fill="var(--text-color, #fff)"
            fontSize={14}
            fontWeight="bold"
          >
            STAGE
          </text>

          {/* Render all seats */}
          <g role="group" aria-label="Seats">
            {seats.map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                priceTier={getPriceTier(seat.priceTier)}
                isSelected={selectedSeatIds.has(seat.id)}
                isFocused={focusedSeatId === seat.id}
                showHeatmap={showHeatmap}
                canSelectMore={canSelectMore}
                onSelect={onSelectSeat}
                onFocus={onFocusSeat}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Instructions */}
      <p className="map-instructions">
        Click or use keyboard to select seats. Drag to pan, scroll to zoom.
      </p>
    </div>
  );
}
