import { useState, useEffect, useCallback, useMemo } from "react";
import type { FlattenedSeat, PriceTiers } from "../types/venue";

const STORAGE_KEY = "seating-selection";
const MAX_SEATS = 8;

interface UseSeatSelectionResult {
  selectedSeatIds: Set<string>;
  focusedSeatId: string | null;
  toggleSeat: (seatId: string) => void;
  setFocusedSeat: (seatId: string | null) => void;
  clearSelection: () => void;
  removeSeat: (seatId: string) => void;
  canSelectMore: boolean;
  selectedCount: number;
}

// Load selection from localStorage
function loadPersistedSelection(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter((id): id is string => typeof id === "string");
      }
    }
  } catch (e) {
    console.warn("Failed to load persisted selection:", e);
  }
  return [];
}

// Save selection to localStorage
function persistSelection(seatIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seatIds));
  } catch (e) {
    console.warn("Failed to persist selection:", e);
  }
}

export function useSeatSelection(): UseSeatSelectionResult {
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(() => {
    return new Set(loadPersistedSelection());
  });
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);

  // Persist selection changes
  useEffect(() => {
    persistSelection(Array.from(selectedSeatIds));
  }, [selectedSeatIds]);

  const canSelectMore = selectedSeatIds.size < MAX_SEATS;
  const selectedCount = selectedSeatIds.size;

  const toggleSeat = useCallback((seatId: string) => {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else if (next.size < MAX_SEATS) {
        next.add(seatId);
      }
      return next;
    });
  }, []);

  const removeSeat = useCallback((seatId: string) => {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      next.delete(seatId);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSeatIds(new Set());
    setFocusedSeatId(null);
  }, []);

  const setFocusedSeat = useCallback((seatId: string | null) => {
    setFocusedSeatId(seatId);
  }, []);

  return {
    selectedSeatIds,
    focusedSeatId,
    toggleSeat,
    setFocusedSeat,
    clearSelection,
    removeSeat,
    canSelectMore,
    selectedCount,
  };
}

// Helper hook to calculate subtotal
export function useSelectionSummary(
  selectedSeatIds: Set<string>,
  flattenedSeats: FlattenedSeat[],
  priceTiers: PriceTiers | undefined
) {
  return useMemo(() => {
    if (!priceTiers) {
      return { seats: [], subtotal: 0 };
    }

    const seatMap = new Map(flattenedSeats.map((s) => [s.id, s]));
    const seats: Array<{ seat: FlattenedSeat; price: number }> = [];
    let subtotal = 0;

    for (const seatId of selectedSeatIds) {
      const seat = seatMap.get(seatId);
      if (seat) {
        const tier = priceTiers[seat.priceTier.toString()];
        const price = tier?.price ?? 0;
        seats.push({ seat, price });
        subtotal += price;
      }
    }

    return { seats, subtotal };
  }, [selectedSeatIds, flattenedSeats, priceTiers]);
}
