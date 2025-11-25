import type { FlattenedSeat } from "../types/venue";

interface SelectionSummaryProps {
  selectedSeats: Array<{ seat: FlattenedSeat; price: number }>;
  subtotal: number;
  maxSeats: number;
  onRemoveSeat: (seatId: string) => void;
  onClearSelection: () => void;
}

export function SelectionSummary({
  selectedSeats,
  subtotal,
  maxSeats,
  onRemoveSeat,
  onClearSelection,
}: SelectionSummaryProps) {
  return (
    <div
      className="selection-summary"
      role="region"
      aria-label="Selection summary"
    >
      <div className="summary-header">
        <h3>Your Selection</h3>
        <span className="seat-count">
          {selectedSeats.length} / {maxSeats} seats
        </span>
      </div>

      {selectedSeats.length === 0 ? (
        <p className="empty-selection">No seats selected yet</p>
      ) : (
        <>
          <ul className="selected-seats-list" role="list">
            {selectedSeats.map(({ seat, price }) => (
              <li key={seat.id} className="selected-seat-item">
                <div className="seat-info">
                  <span className="seat-id">{seat.id}</span>
                  <span className="seat-location">
                    {seat.sectionLabel} • Row {seat.rowIndex} • Seat {seat.col}
                  </span>
                </div>
                <div className="seat-price-remove">
                  <span className="seat-price">${price}</span>
                  <button
                    onClick={() => onRemoveSeat(seat.id)}
                    className="remove-btn"
                    aria-label={`Remove seat ${seat.id}`}
                    title="Remove seat"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="summary-footer">
            <div className="subtotal">
              <span className="subtotal-label">Subtotal:</span>
              <span className="subtotal-value">${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-actions">
              <button
                onClick={onClearSelection}
                className="clear-btn"
                aria-label="Clear all selected seats"
              >
                Clear All
              </button>
              <button className="checkout-btn" aria-label="Proceed to checkout">
                Checkout
              </button>
            </div>
          </div>
        </>
      )}

      {selectedSeats.length >= maxSeats && (
        <p className="max-seats-warning" role="alert">
          Maximum {maxSeats} seats allowed per order
        </p>
      )}
    </div>
  );
}
