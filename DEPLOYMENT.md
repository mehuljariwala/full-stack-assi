# Vercel Deployment Guide

## Deployment URLs

### Frontend
- **URL**: https://full-stack-assi.vercel.app/
- **Description**: React seating map application

### Backend API
The backend API is accessible at the same domain under the `/api` path:

- **Base URL**: https://full-stack-assi.vercel.app/api

### Available Backend Endpoints

#### User Endpoints
- `GET https://full-stack-assi.vercel.app/api/users` - List all users
- `GET https://full-stack-assi.vercel.app/api/users/:id` - Get user by ID (with caching)
- `POST https://full-stack-assi.vercel.app/api/users` - Create a new user

#### Cache & Monitoring Endpoints
- `GET https://full-stack-assi.vercel.app/api/cache-status` - Get cache and API statistics
- `DELETE https://full-stack-assi.vercel.app/api/cache` - Clear the entire cache
- `GET https://full-stack-assi.vercel.app/api/metrics` - Get detailed API metrics
- `GET https://full-stack-assi.vercel.app/api/health` - Health check endpoint
- `GET https://full-stack-assi.vercel.app/api/` - API information and documentation

## Testing the Backend

### Using curl

```bash
# Get all users
curl https://full-stack-assi.vercel.app/api/users

# Get user by ID
curl https://full-stack-assi.vercel.app/api/users/1

# Get cache status
curl https://full-stack-assi.vercel.app/api/cache-status

# Get metrics
curl https://full-stack-assi.vercel.app/api/metrics

# Health check
curl https://full-stack-assi.vercel.app/api/health

# API info
curl https://full-stack-assi.vercel.app/api/
```

### Using Browser

Open these URLs directly in your browser:
- https://full-stack-assi.vercel.app/api/
- https://full-stack-assi.vercel.app/api/users
- https://full-stack-assi.vercel.app/api/cache-status
- https://full-stack-assi.vercel.app/api/metrics
- https://full-stack-assi.vercel.app/api/health

## Deployment Configuration

The project uses `vercel.json` to configure:
- Backend API routes under `/api/*`
- Frontend static files for all other routes
- Serverless function for the Express.js backend

## Local Development

### Backend
```bash
cd backend
pnpm install
pnpm dev
# Runs at http://localhost:3000
```

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
# Runs at http://localhost:5173
```

## Notes

- The backend automatically detects Vercel environment and strips `/api` prefix from requests
- Local development uses routes without `/api` prefix
- All backend endpoints are prefixed with `/api` on Vercel deployment

