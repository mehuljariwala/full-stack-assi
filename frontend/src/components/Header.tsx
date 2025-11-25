interface HeaderProps {
  venueName: string;
  isDarkMode: boolean;
  showHeatmap: boolean;
  onToggleDarkMode: () => void;
  onToggleHeatmap: () => void;
}

export function Header({
  venueName,
  isDarkMode,
  showHeatmap,
  onToggleDarkMode,
  onToggleHeatmap,
}: HeaderProps) {
  return (
    <header className="app-header" role="banner">
      <div className="header-title">
        <h1>{venueName}</h1>
        <span className="header-subtitle">Select Your Seats</span>
      </div>
      <div className="header-controls">
        <button
          onClick={onToggleHeatmap}
          className={`toggle-btn ${showHeatmap ? "active" : ""}`}
          aria-pressed={showHeatmap}
          aria-label="Toggle price heatmap"
        >
          <span className="toggle-label">Price Map</span>
        </button>
        <button
          onClick={onToggleDarkMode}
          className={`toggle-btn ${isDarkMode ? "active" : ""}`}
          aria-pressed={isDarkMode}
          aria-label="Toggle dark mode"
        >
          <span className="toggle-icon">{isDarkMode ? "☀️" : "🌙"}</span>
          <span className="toggle-label">{isDarkMode ? "Light" : "Dark"}</span>
        </button>
      </div>
    </header>
  );
}
