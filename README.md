# Full Stack Assignment

A full-stack application consisting of a high-performance Express.js API backend and an interactive React-based seating map frontend.

## Project Overview

This repository contains two independent but complementary projects:

- **Backend** (`/backend`): A RESTful API with advanced caching, rate limiting, and asynchronous processing
- **Frontend** (`/frontend`): An interactive event seating map application with real-time seat selection

## Repository Structure

```
full-stack-assi/
├── backend/          # Express.js API server
├── frontend/         # React + TypeScript seating map application
└── README.md         # This file
```

## Backend (`/backend`)

A production-ready Express.js API that demonstrates advanced performance optimization techniques.

### What It Does

The backend provides a RESTful API for managing user data with the following features:

- **User Management**: CRUD operations for user resources
- **LRU Caching**: In-memory cache with TTL (60s) and automatic eviction
- **Rate Limiting**: Token bucket algorithm with burst handling (10 req/min sustained, 5 burst)
- **Request Deduplication**: Prevents duplicate database queries for concurrent requests
- **Performance Monitoring**: Real-time metrics collection (response times, cache hit rates, request counts)

### Key Technologies

- Express.js 4
- TypeScript 5 (strict mode)
- Custom LRU cache implementation
- Token bucket rate limiter
- Request queue with promise coalescing

### Quick Start

```bash
cd backend
pnpm install
pnpm dev
```

Server runs at [http://localhost:3000](http://localhost:3000)

### API Endpoints

- `GET /users` - List all users
- `GET /users/:id` - Get user by ID (cached)
- `POST /users` - Create new user
- `GET /cache-status` - Cache statistics
- `DELETE /cache` - Clear cache
- `GET /metrics` - Performance metrics
- `GET /health` - Health check

For detailed documentation, see [backend/README.md](./backend/README.md)

## Frontend (`/frontend`)

An interactive seating map application for event venues with real-time seat selection and pricing.

### What It Does

The frontend renders a scalable SVG-based seating map that allows users to:

- **Browse Venues**: Load and display venue layouts from JSON data
- **Select Seats**: Choose up to 8 seats with mouse or keyboard
- **View Details**: See section, row, seat number, price, and availability
- **Calculate Totals**: Real-time subtotal calculation for selected seats
- **Persist Selection**: Selections saved to localStorage
- **Accessibility**: Full keyboard navigation and screen reader support
- **Dark Mode**: WCAG 2.1 AA compliant with system preference detection
- **Heat Map**: Visual price tier indicators

### Key Technologies

- React 19
- TypeScript 5 (strict mode)
- Vite 7
- SVG rendering for scalable graphics
- CSS custom properties for theming

### Quick Start

```bash
cd frontend
pnpm install
pnpm dev
```

Application runs at [http://localhost:5173](http://localhost:5173)

### Features

- ✅ Smooth 60fps rendering for large venues (~15,000 seats)
- ✅ Pan and zoom controls
- ✅ Touch gesture support for mobile
- ✅ Real-time price calculation
- ✅ Accessibility compliant (WCAG 2.1 AA)
- ✅ Responsive design

For detailed documentation, see [frontend/README.md](./frontend/README.md)

## Development

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Running Both Projects

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
pnpm install
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

## Project Architecture

### Backend Architecture

```
backend/src/
├── cache/           # LRU cache with TTL
├── middleware/      # Rate limiting middleware
├── monitoring/      # Metrics collection
├── queue/           # Request queue with deduplication
├── routes/          # API route handlers
└── types/           # TypeScript definitions
```

### Frontend Architecture

```
frontend/src/
├── components/      # React components
├── hooks/           # Custom React hooks
├── types/           # TypeScript definitions
└── assets/          # Static assets
```

## Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Backend** | Express.js, TypeScript, Custom LRU Cache, Token Bucket Rate Limiter |
| **Frontend** | React 19, TypeScript, Vite, SVG, CSS Custom Properties |
| **Build Tools** | TypeScript 5, tsx (backend), Vite 7 (frontend) |
| **Package Manager** | pnpm |

## License

MIT

