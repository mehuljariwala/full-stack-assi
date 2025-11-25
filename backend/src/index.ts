import express from "express";
import cors from "cors";
import { userRouter } from "./routes/users.js";
import { cacheRouter } from "./routes/cache.js";
import { rateLimitMiddleware } from "./middleware/rateLimiter.js";
import { metricsMiddleware } from "./monitoring/metrics.js";
import { userCache } from "./cache/LRUCache.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Strip /api prefix when running on Vercel (Vercel passes full path including /api)
if (process.env.VERCEL) {
  app.use((req, _res, next) => {
    if (req.path.startsWith("/api")) {
      req.url = req.url.replace(/^\/api/, "") || "/";
    }
    next();
  });
}

// Metrics middleware (records all requests)
app.use(metricsMiddleware);

// Rate limiting middleware
app.use(rateLimitMiddleware);

// Routes
app.use("/users", userRouter);
app.use("/", cacheRouter);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    name: "User Data API",
    version: "1.0.0",
    description:
      "Express.js API with advanced caching, rate limiting, and async processing",
    endpoints: {
      users: {
        "GET /users": "List all users",
        "GET /users/:id": "Get user by ID (with caching)",
        "POST /users": "Create a new user",
      },
      cache: {
        "GET /cache-status": "Get cache and API statistics",
        "DELETE /cache": "Clear the entire cache",
      },
      monitoring: {
        "GET /metrics": "Get detailed API metrics",
        "GET /health": "Health check endpoint",
      },
    },
    documentation: "See README.md for full documentation",
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist.",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[Error]", err.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred.",
      timestamp: new Date().toISOString(),
    });
  }
);

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== "1") {
  // Start server
  const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                    User Data API v1.0.0                    ║
╠════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                  ║
║                                                            ║
║  Endpoints:                                                ║
║    GET  /users         - List all users                    ║
║    GET  /users/:id     - Get user by ID                    ║
║    POST /users         - Create new user                   ║
║    GET  /cache-status  - Cache statistics                  ║
║    DELETE /cache       - Clear cache                       ║
║    GET  /metrics       - API metrics                       ║
║    GET  /health        - Health check                      ║
║                                                            ║
║  Features:                                                 ║
║    ✓ LRU Cache (60s TTL)                                   ║
║    ✓ Rate Limiting (10/min + 5 burst/10s)                  ║
║    ✓ Request Deduplication                                 ║
║    ✓ Performance Monitoring                                ║
╚════════════════════════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("\n[Shutdown] Received SIGTERM, shutting down gracefully...");
    server.close(() => {
      userCache.stopCleanup();
      console.log("[Shutdown] Server closed.");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("\n[Shutdown] Received SIGINT, shutting down gracefully...");
    server.close(() => {
      userCache.stopCleanup();
      console.log("[Shutdown] Server closed.");
      process.exit(0);
    });
  });
}

export { app };
