import { useState, useEffect, useMemo } from "react";
import type { VenueData, FlattenedSeat } from "../types/venue";

interface UseVenueDataResult {
  venue: VenueData | null;
  flattenedSeats: FlattenedSeat[];
  loading: boolean;
  error: string | null;
}

export function useVenueData(): UseVenueDataResult {
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await fetch("/venue.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch venue data: ${response.status}`);
        }
        const data: VenueData = await response.json();
        setVenue(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, []);

  // Flatten all seats for efficient rendering and lookups
  const flattenedSeats = useMemo<FlattenedSeat[]>(() => {
    if (!venue) return [];

    const seats: FlattenedSeat[] = [];
    for (const section of venue.sections) {
      for (const row of section.rows) {
        for (const seat of row.seats) {
          seats.push({
            ...seat,
            sectionId: section.id,
            sectionLabel: section.label,
            rowIndex: row.index,
          });
        }
      }
    }
    return seats;
  }, [venue]);

  return { venue, flattenedSeats, loading, error };
}
