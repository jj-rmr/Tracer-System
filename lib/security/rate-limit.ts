export interface RateLimitResult {
  limited: boolean;
  retryAfterSeconds: number;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface RateBucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, RateBucket>();
  private readonly maximumBuckets: number;
  private readonly cleanupIntervalMs: number;
  private nextCleanupAt = 0;

  constructor(maximumBuckets = 10_000, cleanupIntervalMs = 60_000) {
    if (maximumBuckets < 1 || cleanupIntervalMs < 1) {
      throw new Error("Rate limiter bounds must be positive.");
    }

    this.maximumBuckets = maximumBuckets;
    this.cleanupIntervalMs = cleanupIntervalMs;
  }

  consume(
    key: string,
    maximumRequests: number,
    windowMs: number,
    now = Date.now(),
  ): RateLimitResult {
    if (
      !Number.isSafeInteger(maximumRequests) ||
      maximumRequests < 1 ||
      !Number.isSafeInteger(windowMs) ||
      windowMs < 1
    ) {
      throw new Error("Rate limit and window must be positive integers.");
    }

    this.cleanupIfNeeded(now);

    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      if (!current) this.makeRoom();
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return {
        limited: false,
        retryAfterSeconds: 0,
        limit: maximumRequests,
        remaining: maximumRequests - 1,
        resetAt,
      };
    }

    current.count = Math.min(current.count + 1, maximumRequests + 1);
    if (current.count <= maximumRequests) {
      return {
        limited: false,
        retryAfterSeconds: 0,
        limit: maximumRequests,
        remaining: maximumRequests - current.count,
        resetAt: current.resetAt,
      };
    }

    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      limit: maximumRequests,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  private cleanupIfNeeded(now: number) {
    if (now < this.nextCleanupAt && this.buckets.size < this.maximumBuckets) {
      return;
    }

    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
    this.nextCleanupAt = now + this.cleanupIntervalMs;
  }

  private makeRoom() {
    if (this.buckets.size < this.maximumBuckets) return;

    let earliestKey: string | undefined;
    let earliestReset = Number.POSITIVE_INFINITY;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt < earliestReset) {
        earliestKey = key;
        earliestReset = bucket.resetAt;
      }
    }
    if (earliestKey !== undefined) this.buckets.delete(earliestKey);
  }
}
