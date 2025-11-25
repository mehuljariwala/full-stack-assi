import { Router } from "express";
import type { Request, Response, Router as ExpressRouter } from "express";
import { userCache } from "../cache/LRUCache.js";
import { metricsCollector } from "../monitoring/metrics.js";
import { userRequestQueue } from "../queue/RequestQueue.js";

const router: ExpressRouter = Router();

/**
 * GET /cache-status
 * Get current cache statistics and performance metrics
 */
router.get("/cache-status", (_req: Request, res: Response) => {
  const cacheStats = userCache.getStats();
  const apiMetrics = metricsCollector.getSummary();
  const queueStatus = userRequestQueue.getStatus();

  res.json({
    success: true,
    data: {
      cache: {
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate:
          cacheStats.totalRequests > 0
            ? (cacheStats.hits / cacheStats.totalRequests).toFixed(3)
            : "0.000",
        ttlSeconds: cacheStats.ttl,
        avgResponseTime: `${cacheStats.avgResponseTime.toFixed(2)}ms`,
      },
      api: {
        totalRequests: apiMetrics.totalRequests,
        successCount: apiMetrics.successCount,
        errorCount: apiMetrics.errorCount,
        errorRate: `${(apiMetrics.errorRate * 100).toFixed(2)}%`,
        avgResponseTime: `${apiMetrics.avgResponseTime.toFixed(2)}ms`,
        p95ResponseTime: `${apiMetrics.p95ResponseTime.toFixed(2)}ms`,
        p99ResponseTime: `${apiMetrics.p99ResponseTime.toFixed(2)}ms`,
        requestsPerSecond: apiMetrics.requestsPerSecond.toFixed(2),
        cacheHitRate: `${(apiMetrics.cacheHitRate * 100).toFixed(2)}%`,
      },
      queue: {
        queueLength: queueStatus.queueLength,
        activeRequests: queueStatus.activeRequests,
        inFlightRequests: queueStatus.inFlightKeys.length,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * DELETE /cache
 * Clear entire cache
 */
router.delete("/cache", (_req: Request, res: Response) => {
  const previousSize = userCache.size;
  userCache.clear();

  res.json({
    success: true,
    message: "Cache cleared successfully.",
    data: {
      entriesCleared: previousSize,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /metrics
 * Get detailed API metrics
 */
router.get("/metrics", (_req: Request, res: Response) => {
  const metrics = metricsCollector.getSummary();

  res.json({
    success: true,
    data: {
      ...metrics,
      recentRequests: metrics.recentRequests.map((r) => ({
        ...r,
        timestamp: r.timestamp.toISOString(),
      })),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health
 * Health check endpoint
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export { router as cacheRouter };
