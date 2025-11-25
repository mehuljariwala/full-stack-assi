/**
 * Async Request Queue with in-flight deduplication
 * Handles concurrent requests for the same resource efficiently
 */

type Resolver<T> = (value: T) => void;
type Rejecter = (error: Error) => void;

interface PendingRequest<T> {
  resolve: Resolver<T>;
  reject: Rejecter;
}

interface InFlightRequest<T> {
  promise: Promise<T>;
  pendingResolvers: PendingRequest<T>[];
}

export class RequestQueue<T> {
  private inFlight: Map<string, InFlightRequest<T>> = new Map();
  private queue: Array<{ key: string; execute: () => Promise<T> }> = [];
  private processing: boolean = false;
  private concurrency: number;
  private activeCount: number = 0;

  constructor(concurrency: number = 5) {
    this.concurrency = concurrency;
  }

  /**
   * Execute a request with deduplication
   * If the same key is already in-flight, wait for that result
   */
  async execute(key: string, fetchFn: () => Promise<T>): Promise<T> {
    // Check if request is already in-flight
    const inFlight = this.inFlight.get(key);
    if (inFlight) {
      // Return a promise that resolves when the in-flight request completes
      return new Promise<T>((resolve, reject) => {
        inFlight.pendingResolvers.push({ resolve, reject });
      });
    }

    // Create new in-flight request
    const request: InFlightRequest<T> = {
      promise: null as unknown as Promise<T>,
      pendingResolvers: [],
    };

    // Create the actual promise
    request.promise = new Promise<T>((resolve, reject) => {
      this.queue.push({
        key,
        execute: async () => {
          try {
            const result = await fetchFn();
            resolve(result);
            // Resolve all pending requests for the same key
            for (const pending of request.pendingResolvers) {
              pending.resolve(result);
            }
            return result;
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            reject(err);
            // Reject all pending requests for the same key
            for (const pending of request.pendingResolvers) {
              pending.reject(err);
            }
            throw err;
          } finally {
            this.inFlight.delete(key);
          }
        },
      });
    });

    this.inFlight.set(key, request);
    this.processQueue();

    return request.promise;
  }

  /**
   * Process queued requests respecting concurrency limit
   */
  private processQueue(): void {
    if (this.processing) return;
    this.processing = true;

    const process = async () => {
      while (this.queue.length > 0 && this.activeCount < this.concurrency) {
        const task = this.queue.shift();
        if (task) {
          this.activeCount++;
          task.execute().finally(() => {
            this.activeCount--;
            if (this.queue.length > 0) {
              process();
            }
          });
        }
      }
      this.processing = false;
    };

    process();
  }

  /**
   * Get current queue status
   */
  getStatus(): {
    queueLength: number;
    activeRequests: number;
    inFlightKeys: string[];
  } {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeCount,
      inFlightKeys: Array.from(this.inFlight.keys()),
    };
  }

  /**
   * Clear the queue (for shutdown)
   */
  clear(): void {
    this.queue = [];
    this.inFlight.clear();
  }
}

// Singleton instance for user requests
export const userRequestQueue = new RequestQueue<unknown>(10);
