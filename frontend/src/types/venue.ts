// Seat status types
export type SeatStatus = "available" | "reserved" | "sold" | "held";

// Individual seat data
export interface Seat {
  id: string;
  col: number;
  x: number;
  y: number;
  priceTier: number;
  status: SeatStatus;
}

// Row containing seats
export interface Row {
  index: number;
  seats: Seat[];
}

// Section transform properties
export interface Transform {
  x: number;
  y: number;
  scale: number;
}

// Section of the venue
export interface Section {
  id: string;
  label: string;
  transform: Transform;
  rows: Row[];
}

// Price tier information
export interface PriceTier {
  price: number;
  label: string;
  color: string;
}

// Price tiers mapping
export interface PriceTiers {
  [key: string]: PriceTier;
}

// Map dimensions
export interface MapDimensions {
  width: number;
  height: number;
}

// Complete venue data structure
export interface VenueData {
  venueId: string;
  name: string;
  map: MapDimensions;
  priceTiers: PriceTiers;
  sections: Section[];
}

// Flattened seat with additional context for rendering
export interface FlattenedSeat extends Seat {
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
}

// Selection state
export interface SelectionState {
  selectedSeats: string[];
  focusedSeat: string | null;
}

// Seat details for display
export interface SeatDetails {
  seat: FlattenedSeat;
  priceTier: PriceTier;
}
