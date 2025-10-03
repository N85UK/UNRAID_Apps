import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor() {
    this.maxRequests = Number(process.env.FILEMANAGER_RATE_LIMIT || 120); // per window
    this.windowMs = Number(process.env.FILEMANAGER_RATE_WINDOW_MS || 60_000); // 1 minute
  }

  isAllowed(key: string) {
    if (!key) key = 'anonymous';
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (bucket.count < this.maxRequests) {
      bucket.count += 1;
      return true;
    }

    this.logger.warn(`Rate limit exceeded for ${key}`);
    return false;
  }
}
