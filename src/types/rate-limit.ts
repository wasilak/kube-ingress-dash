/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}

/**
 * Rate limit entry for tracking client requests
 */
export interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (identifier: string) => string;
}
