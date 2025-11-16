/**
 * Kubernetes client configuration
 */
export interface KubernetesConfig {
  inCluster: boolean;
  configPath?: string;
  requestTimeout: number;
  maxRetries: number;
  throttleMs: number;
}

/**
 * Feature flags for enabling/disabling functionality
 */
export interface FeatureFlags {
  enableCaching: boolean;
  enableRateLimiting: boolean;
  enableMetrics: boolean;
  enableVirtualScrolling: boolean;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  k8sThrottleMs: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  type: 'memory' | 'redis';
  ttl: number;
  redisUrl?: string;
  maxSize?: number;
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  cspDirectives: Record<string, string[]>;
  hstsMaxAge: number;
  enableFrameOptions: boolean;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  kubernetes: KubernetesConfig;
  features: FeatureFlags;
  logging: LoggingConfig;
  rateLimit: RateLimitConfig;
  cache: CacheConfig;
  security: SecurityConfig;
}
