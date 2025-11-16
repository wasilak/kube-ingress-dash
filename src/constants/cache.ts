/**
 * Cache Constants
 *
 * Constants related to caching strategies, TTL values, and cache keys.
 */

/**
 * Cache Key Prefixes
 *
 * Prefixes used to namespace cache keys.
 */
export const CACHE_KEYS = {
  /** Cache key for namespace list */
  NAMESPACES: 'namespaces',

  /** Cache key generator for ingresses by namespace */
  INGRESSES: (namespace: string) => `ingresses:${namespace}`,

  /** Cache key for all ingresses */
  ALL_INGRESSES: 'ingresses:all',
} as const;

/**
 * Cache TTL Values (in seconds)
 *
 * Time-to-live values for different cached resources.
 */
export const CACHE_TTL = {
  /** TTL for namespace list (5 minutes) */
  NAMESPACES: 300,

  /** TTL for ingress list (1 minute) */
  INGRESSES: 60,

  /** TTL for health check results (30 seconds) */
  HEALTH_CHECK: 30,
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  /** Default cache type */
  DEFAULT_TYPE: 'memory' as const,

  /** Maximum cache size (number of entries) */
  MAX_SIZE: 1000,
} as const;
