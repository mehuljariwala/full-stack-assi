import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  tokens: number;
  burstTokens: number;
  lastRefill: number;
  lastBurstRefill: number;
}

interface RateLimiterConfig {
  maxRequestsPerMinute: number;
  burstCapacity: number;
  burstWindowSeconds: number;
}

/**
 * Token Bucket Rate Limiter with burst handling
 * - 10 requests per minute limit
 * - 5 request burst capacity per 10 second window
 */
export class TokenBucketRateLimiter {
  private buckets: Map<string, RateLimitEntry> = new Map();
  private readonly config: RateLimiterConfig;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      maxRequestsPerMinute: config.maxRequestsPerMinute ?? 10,
      burstCapacity: config.burstCapacity ?? 5,
      burstWindowSeconds: config.burstWindowSeconds ?? 10,
    };

    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request is allowed and consume tokens
   */
  consume(key: string): {
    allowed: boolean;
    remaining: number;
    burstRemaining: number;
    resetIn: number;
  } {
    const now = Date.now();
    let entry = this.buckets.get(key);

    if (!entry) {
      entry = {
        tokens: this.config.maxRequestsPerMinute,
        burstTokens: this.config.burstCapacity,
        lastRefill: now,
        lastBurstRefill: now,
      };
      this.buckets.set(key, entry);
    }

    // Refill main bucket (1 token per 6 seconds = 10 per minute)
    const timeSinceRefill = now - entry.lastRefill;
    const tokensToAdd = Math.floor(timeSinceRefill / 6000); // 6 seconds per token
    if (tokensToAdd > 0) {
      entry.tokens = Math.min(
        this.config.maxRequestsPerMinute,
        entry.tokens + tokensToAdd
      );
      entry.lastRefill = now;
    }

    // Refill burst bucket (full refill every 10 seconds)
    const burstTimeSinceRefill = now - entry.lastBurstRefill;
    if (burstTimeSinceRefill >= this.config.burstWindowSeconds * 1000) {
      entry.burstTokens = this.config.burstCapacity;
      entry.lastBurstRefill = now;
    }

    // Try to consume from burst bucket first, then main bucket
    if (entry.burstTokens > 0) {
      entry.burstTokens--;
      return {
        allowed: true,
        remaining: entry.tokens,
        burstRemaining: entry.burstTokens,
        resetIn: Math.ceil(
          (this.config.burstWindowSeconds * 1000 - burstTimeSinceRefill) / 1000
        ),
      };
    }

    if (entry.tokens > 0) {
      entry.tokens--;
      return {
        allowed: true,
        remaining: entry.tokens,
        burstRemaining: entry.burstTokens,
        resetIn: 6, // Next token in 6 seconds
      };
    }

    // Rate limited
    const nextRefill = 6 - (timeSinceRefill % 6000) / 1000;
    return {
      allowed: false,
      remaining: 0,
      burstRemaining: 0,
      resetIn: Math.ceil(nextRefill),
    };
  }

  /**
   * Remove old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [key, entry] of this.buckets.entries()) {
      if (now - entry.lastRefill > maxAge) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Stop cleanup interval
   */
  stop(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Singleton rate limiter instance
const rateLimiter = new TokenBucketRateLimiter({
  maxRequestsPerMinute: 10,
  burstCapacity: 5,
  burstWindowSeconds: 10,
});

/**
 * Express middleware for rate limiting
 */
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Use IP address as key (in production, consider X-Forwarded-For)
  const key = req.ip ?? req.socket.remoteAddress ?? "unknown";

  const result = rateLimiter.consume(key);

  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", "10");
  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
  res.setHeader("X-RateLimit-Reset", result.resetIn.toString());
  res.setHeader(
    "X-RateLimit-Burst-Remaining",
    result.burstRemaining.toString()
  );

  if (!result.allowed) {
    res.status(429).json({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please try again in ${result.resetIn} seconds.`,
      retryAfter: result.resetIn,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
}

export { rateLimiter };
