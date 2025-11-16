/**
 * Kubernetes Constants
 *
 * Constants related to Kubernetes API interactions, namespaces, and watch operations.
 */

/**
 * Default Kubernetes Namespace
 */
export const KUBERNETES_NAMESPACE = {
  DEFAULT: 'default',
  KUBE_SYSTEM: 'kube-system',
} as const;

/**
 * Kubernetes Watch Event Types
 *
 * Event types emitted by Kubernetes watch streams.
 */
export const KUBERNETES_WATCH_EVENT = {
  ADDED: 'ADDED',
  MODIFIED: 'MODIFIED',
  DELETED: 'DELETED',
} as const;

/**
 * Kubernetes Watch Event Type Mapping
 *
 * Maps Kubernetes watch event types to application event names.
 */
export const KUBERNETES_EVENT_MAP = {
  ADDED: 'ingressAdded',
  MODIFIED: 'ingressModified',
  DELETED: 'ingressDeleted',
} as const;

/**
 * Kubernetes API Timeouts (in milliseconds)
 */
export const KUBERNETES_TIMEOUTS = {
  /** Default timeout for Kubernetes API requests */
  REQUEST_TIMEOUT: 30000, // 30 seconds

  /** Timeout for watch connections */
  WATCH_TIMEOUT: 300000, // 5 minutes

  /** Timeout for circuit breaker recovery attempts */
  CIRCUIT_BREAKER_TIMEOUT: 60000, // 60 seconds

  /** Window for tracking circuit breaker failures */
  CIRCUIT_BREAKER_WINDOW: 30000, // 30 seconds

  /** Delay before reconnecting after watch failure */
  RECONNECT_DELAY: 5000, // 5 seconds

  /** Timeout for health check operations */
  HEALTH_CHECK_TIMEOUT: 5000, // 5 seconds
} as const;

/**
 * Kubernetes API Retry Configuration
 */
export const KUBERNETES_RETRY = {
  /** Maximum number of retry attempts */
  MAX_ATTEMPTS: 3,

  /** Initial delay before first retry (in milliseconds) */
  INITIAL_DELAY: 100, // 100ms

  /** Maximum delay between retries (in milliseconds) */
  MAX_DELAY: 5000, // 5 seconds

  /** Backoff multiplier for exponential backoff */
  BACKOFF_MULTIPLIER: 2,
} as const;

/**
 * Kubernetes Circuit Breaker Configuration
 */
export const KUBERNETES_CIRCUIT_BREAKER = {
  /** Failure rate threshold to open circuit (0.5 = 50%) */
  FAILURE_THRESHOLD: 0.5,

  /** Number of successful requests needed to close circuit */
  SUCCESS_THRESHOLD: 1,
} as const;

/**
 * Security Configuration
 */
export const SECURITY = {
  /** HSTS max-age in seconds (1 year) */
  HSTS_MAX_AGE: 31536000,
} as const;
