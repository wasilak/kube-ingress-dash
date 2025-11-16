/**
 * Error Messages and Constants
 *
 * Standardized error messages and error-related constants used throughout the application.
 */

/**
 * Error Categories
 *
 * Categories used to classify different types of errors.
 */
export const ERROR_CATEGORY = {
  TRANSIENT: 'transient',
  PERMANENT: 'permanent',
  RATE_LIMIT: 'rate_limit',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
} as const;

/**
 * Error Messages
 *
 * Standardized error messages for common error scenarios.
 */
export const ERROR_MESSAGES = {
  // Kubernetes API Errors
  KUBERNETES_API_UNAVAILABLE: 'Kubernetes API is unavailable',
  KUBERNETES_CONNECTION_FAILED: 'Failed to connect to Kubernetes API',
  KUBERNETES_TIMEOUT: 'Kubernetes API request timed out',
  KUBERNETES_NOT_FOUND: 'Kubernetes resource not found',

  // Authentication Errors
  AUTHENTICATION_FAILED: 'Authentication failed',
  INVALID_CREDENTIALS: 'Invalid credentials provided',
  TOKEN_EXPIRED: 'Authentication token has expired',

  // Authorization Errors
  AUTHORIZATION_FAILED: 'Authorization failed',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to access resource',
  RBAC_ERROR: 'RBAC permissions denied',

  // Rate Limiting Errors
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',

  // Network Errors
  NETWORK_ERROR: 'Network error occurred',
  CONNECTION_REFUSED: 'Connection refused',
  REQUEST_TIMEOUT: 'Request timed out',

  // Server Errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',

  // Circuit Breaker Errors
  CIRCUIT_BREAKER_OPEN: 'Circuit breaker is open, service unavailable',
  CIRCUIT_BREAKER_TIMEOUT: 'Circuit breaker timeout',

  // Validation Errors
  INVALID_REQUEST: 'Invalid request',
  INVALID_NAMESPACE: 'Invalid namespace provided',
  INVALID_PARAMETERS: 'Invalid parameters provided',

  // Generic Errors
  UNKNOWN_ERROR: 'An unknown error occurred',
  OPERATION_FAILED: 'Operation failed',
} as const;

/**
 * Error Patterns
 *
 * Regular expression patterns for identifying specific error types.
 */
export const ERROR_PATTERNS = {
  NOT_FOUND: /not found|404/i,
  UNAUTHORIZED: /unauthorized|401/i,
  FORBIDDEN: /forbidden|403/i,
  TIMEOUT: /timeout|timed out/i,
  CONNECTION_REFUSED: /connection refused|econnrefused/i,
  RATE_LIMIT: /rate limit|too many requests|429/i,
} as const;

/**
 * Retryable Error Indicators
 *
 * Strings that indicate an error is transient and retryable.
 */
export const RETRYABLE_ERROR_INDICATORS = [
  'timeout',
  'timed out',
  'connection refused',
  'econnrefused',
  'network error',
  'temporary failure',
  'service unavailable',
  '503',
  '500',
] as const;

/**
 * Permanent Error Indicators
 *
 * Strings that indicate an error is permanent and should not be retried.
 */
export const PERMANENT_ERROR_INDICATORS = [
  'not found',
  '404',
  'bad request',
  '400',
  'forbidden',
  '403',
  'unauthorized',
  '401',
] as const;
