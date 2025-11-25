import type { RequestMetrics } from "../types/index.js";

/**
 * API Metrics collector for monitoring performance
 */
class MetricsCollector {
  private metrics: RequestMetrics[] = [];
  private maxMetrics: number = 10000;
  private errorCount: number = 0;
  private successCount: number = 0;

  /**
   * Record a request metric
   */
  record(metric: RequestMetrics): void {
    this.metrics.push(metric);

    // Track success/error counts
    if (metric.statusCode >= 400) {
      this.errorCount++;
    } else {
      this.successCount++;
    }

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log significant events
    if (metric.statusCode >= 500) {
      console.error(
        `[Metrics] Server Error: ${metric.method} ${metric.path} - ${metric.statusCode} (${metric.responseTime}ms)`
      );
    } else if (metric.responseTime > 1000) {
      console.warn(
        `[Metrics] Slow Request: ${metric.method} ${metric.path} - ${metric.responseTime}ms`
      );
    }
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    errorRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
    cacheHitRate: number;
    recentRequests: RequestMetrics[];
  } {
    const total = this.metrics.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        successCount: 0,
        errorCount: 0,
        errorRate: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        requestsPerSecond: 0,
        cacheHitRate: 0,
        recentRequests: [],
      };
    }

    const responseTimes = this.metrics
      .map((m) => m.responseTime)
      .sort((a, b) => a - b);
    const cachedRequests = this.metrics.filter((m) => m.cached).length;

    // Calculate time window for RPS
    const oldestMetric = this.metrics[0];
    const newestMetric = this.metrics[this.metrics.length - 1];
    const timeWindowSeconds =
      oldestMetric && newestMetric
        ? Math.max(
            1,
            (newestMetric.timestamp.getTime() -
              oldestMetric.timestamp.getTime()) /
              1000
          )
        : 1;

    return {
      totalRequests: this.successCount + this.errorCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      errorRate: this.errorCount / (this.successCount + this.errorCount),
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / total,
      p95ResponseTime: responseTimes[Math.floor(total * 0.95)] ?? 0,
      p99ResponseTime: responseTimes[Math.floor(total * 0.99)] ?? 0,
      requestsPerSecond: total / timeWindowSeconds,
      cacheHitRate: cachedRequests / total,
      recentRequests: this.metrics.slice(-10),
    };
  }

  /**
   * Get metrics by path
   */
  getByPath(path: string): RequestMetrics[] {
    return this.metrics.filter((m) => m.path.includes(path));
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.errorCount = 0;
    this.successCount = 0;
  }

  /**
   * Get metrics count
   */
  get count(): number {
    return this.metrics.length;
  }
}

// Singleton instance
export const metricsCollector = new MetricsCollector();

/**
 * Express middleware to record request metrics
 */
import type { Request, Response, NextFunction } from "express";

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Capture original end function
  const originalEnd = res.end.bind(res);

  // Override end to record metrics
  res.end = function (
    chunk?: unknown,
    encoding?: BufferEncoding | (() => void),
    callback?: () => void
  ): Response {
    const responseTime = Date.now() - startTime;

    metricsCollector.record({
      path: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      cached: res.getHeader("X-Cache") === "HIT",
    });

    // Call original end with proper typing
    if (typeof encoding === "function") {
      return originalEnd(chunk, encoding);
    }
    return originalEnd(chunk, encoding, callback);
  };

  next();
}
