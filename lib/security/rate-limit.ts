export interface RateLimitResult {
  limited: boolean;
  retryAfterSeconds: number;
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
    this.cleanupIfNeeded(now);

    const current = this.buckets.get(key);
    if (!current || current.resetAt <= now) {
      if (!current) this.makeRoom();
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { limited: false, retryAfterSeconds: 0 };
    }

    current.count += 1;
    if (current.count <= maximumRequests) {
      return { limited: false, retryAfterSeconds: 0 };
    }

    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
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

    const oldestKey = this.buckets.keys().next().value;
    if (oldestKey !== undefined) this.buckets.delete(oldestKey);
  }
}
