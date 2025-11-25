// User data type
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: Date;
}

// Cache entry with metadata
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
}

// Cache statistics
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  ttl: number;
  avgResponseTime: number;
  totalRequests: number;
}

// Rate limit info
export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
  burstRemaining: number;
}

// Request metrics
export interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  cached: boolean;
}

// Queue task
export interface QueueTask<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  createdAt: number;
}

// API error response
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// API success response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  cached: boolean;
  responseTime: number;
}
