import { useState } from "react";
import { useVenueData } from "./hooks/useVenueData";
import {
  useSeatSelection,
  useSelectionSummary,
} from "./hooks/useSeatSelection";
import { useDarkMode } from "./hooks/useDarkMode";
import { Header } from "./components/Header";
import { SeatingMap } from "./components/SeatingMap";
import { SeatDetails } from "./components/SeatDetails";
import { SelectionSummary } from "./components/SelectionSummary";
import { Legend } from "./components/Legend";
import "./App.css";

const MAX_SEATS = 8;

function App() {
  const { venue, flattenedSeats, loading, error } = useVenueData();
  const {
    selectedSeatIds,
    focusedSeatId,
    toggleSeat,
    setFocusedSeat,
    clearSelection,
    removeSeat,
    canSelectMore,
  } = useSeatSelection();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showHeatmap, setShowHeatmap] = useState(false);

  const { seats: selectedSeatsData, subtotal } = useSelectionSummary(
    selectedSeatIds,
    flattenedSeats,
    venue?.priceTiers
  );

  const handleToggleHeatmap = () => {
    setShowHeatmap((prev) => !prev);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`app ${isDarkMode ? "dark" : ""}`}>
        <div className="loading-container">
          <div className="loading-spinner" aria-label="Loading venue data" />
          <p>Loading venue...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !venue) {
    return (
      <div className={`app ${isDarkMode ? "dark" : ""}`}>
        <div className="error-container" role="alert">
          <h2>Error Loading Venue</h2>
          <p>{error ?? "Unable to load venue data"}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isDarkMode ? "dark" : ""}`}>
      <Header
        venueName={venue.name}
        isDarkMode={isDarkMode}
        showHeatmap={showHeatmap}
        onToggleDarkMode={toggleDarkMode}
        onToggleHeatmap={handleToggleHeatmap}
      />

      <main className="app-main">
        <div className="map-section">
          <SeatingMap
            seats={flattenedSeats}
            priceTiers={venue.priceTiers}
            mapDimensions={venue.map}
            selectedSeatIds={selectedSeatIds}
            focusedSeatId={focusedSeatId}
            showHeatmap={showHeatmap}
            canSelectMore={canSelectMore}
            onSelectSeat={toggleSeat}
            onFocusSeat={setFocusedSeat}
          />
          <Legend priceTiers={venue.priceTiers} showHeatmap={showHeatmap} />
        </div>

        <aside className="sidebar">
          <SeatDetails
            seatId={focusedSeatId}
            seats={flattenedSeats}
            priceTiers={venue.priceTiers}
            isSelected={
              focusedSeatId ? selectedSeatIds.has(focusedSeatId) : false
            }
          />
          <SelectionSummary
            selectedSeats={selectedSeatsData}
            subtotal={subtotal}
            maxSeats={MAX_SEATS}
            onRemoveSeat={removeSeat}
            onClearSelection={clearSelection}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <p>
          Total seats: {flattenedSeats.length} | Available:{" "}
          {flattenedSeats.filter((s) => s.status === "available").length}
        </p>
      </footer>
    </div>
  );
}

export default App;
