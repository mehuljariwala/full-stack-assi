# Interactive Event Seating Map

A React + TypeScript application that renders an interactive seating map for event venues, allowing users to select up to 8 seats with real-time pricing and accessibility features.

## Quick Start

```bash
pnpm install && pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Architecture & Design Decisions

### Component Architecture

The application follows a modular component-based architecture with clear separation of concerns:

- **Hooks Layer** (`src/hooks/`): Custom React hooks encapsulate all state management logic:
  - `useVenueData`: Fetches and flattens venue data for efficient rendering
  - `useSeatSelection`: Manages seat selection state with localStorage persistence
  - `useDarkMode`: Handles theme preference with system detection
  
- **Components Layer** (`src/components/`): Presentational components with minimal internal state:
  - `SeatingMap`: Main SVG canvas with pan/zoom controls
  - `Seat`: Memoized individual seat rendering (critical for performance)
  - `SeatDetails`: Live seat information display
  - `SelectionSummary`: Selected seats list with subtotal
  - `Legend` & `Header`: UI controls and information

### Performance Optimizations

For handling large venues (~15,000 seats) at 60fps:

1. **React.memo with Custom Comparison**: The `Seat` component uses a custom comparison function to prevent unnecessary re-renders. Only seats whose state actually changes (selection, focus, status) will re-render.

2. **Flattened Data Structure**: Venue data is pre-flattened into a single array during loading, eliminating nested iteration during renders.

3. **Callback Memoization**: All event handlers use `useCallback` to maintain referential equality across renders.

4. **CSS Transform for Pan/Zoom**: Instead of recalculating positions, we use CSS transforms on the SVG container for smooth pan and zoom operations.

### Trade-offs & Considerations

1. **SVG vs Canvas**: Chose SVG for better accessibility (each seat is a focusable DOM element) and easier event handling. For venues with 50,000+ seats, Canvas with spatial hashing would be more performant.

2. **No Virtualization Library**: Implemented lightweight pan/zoom without a virtualization library (like react-window) to keep the bundle small. Full DOM rendering works well up to ~15,000 elements with proper memoization.

3. **CSS-in-CSS vs CSS-in-JS**: Used plain CSS with CSS custom properties for theming to minimize runtime overhead and improve initial load time.

4. **Local State vs Global State**: Used React hooks instead of Redux/Zustand since the state is relatively simple and localized. This reduces complexity and bundle size.

## Features

### Core Requirements ✅
- Load venue.json and render seats at correct positions
- Smooth 60fps rendering for large arenas
- Mouse and keyboard seat selection
- Seat details on click/focus (section, row, seat, price, status)
- Select up to 8 seats with live subtotal
- localStorage persistence for selections
- Accessibility: aria-labels, focus outlines, keyboard navigation
- Responsive design for desktop and mobile

### Stretch Goals ✅
- **Heat-map toggle**: Colors available seats by price tier
- **Dark mode**: WCAG 2.1 AA compliant with system preference detection
- **Touch support**: Pan gestures for mobile devices

### Incomplete / TODOs
- **WebSocket live updates**: Not implemented - would require a backend
- **"Find N adjacent seats" helper**: Algorithm designed but not implemented due to time
- **Pinch-zoom**: Basic touch pan is implemented, but multi-touch pinch-zoom would require additional gesture handling
- **E2E tests**: Unit tests could be added with Vitest; E2E with Playwright

## Project Structure

```
src/
├── components/
│   ├── Header.tsx        # App header with controls
│   ├── Legend.tsx        # Status and price tier legend
│   ├── Seat.tsx          # Individual seat (memoized)
│   ├── SeatDetails.tsx   # Focused seat information
│   ├── SeatingMap.tsx    # Main SVG map with pan/zoom
│   └── SelectionSummary.tsx # Selection list and checkout
├── hooks/
│   ├── useDarkMode.ts    # Theme management
│   ├── useSeatSelection.ts # Selection + persistence
│   └── useVenueData.ts   # Data fetching + flattening
├── types/
│   └── venue.ts          # TypeScript interfaces
├── App.tsx               # Main app component
├── App.css               # Component styles
├── index.css             # Global styles
└── main.tsx              # Entry point
```

## Technology Stack

- **React 19** - UI framework
- **TypeScript 5** - Type safety with strict mode
- **Vite 7** - Build tool and dev server
- **ESLint** - Code linting

No additional runtime dependencies were needed - the application is built entirely with React and browser APIs.

## Testing

To add tests, install Vitest:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Example test structure would include:
- Unit tests for hooks (selection logic, localStorage)
- Component tests for Seat rendering and interaction
- Integration tests for the full selection flow

## Browser Support

Tested on:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

Requires browsers that support:
- CSS Custom Properties
- CSS Grid
- SVG
- localStorage API

## Accessibility

- All interactive seats are keyboard focusable
- Comprehensive aria-labels describe seat location, price, and status
- Focus indicators meet WCAG 2.1 AA contrast requirements
- Reduced motion preference is respected
- Screen reader announcements for selection changes

## License

MIT
