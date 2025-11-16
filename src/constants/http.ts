/**
 * HTTP Status Codes
 *
 * Standard HTTP status codes used throughout the application.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * HTTP Status Code Ranges
 *
 * Used for checking status code categories.
 */
export const HTTP_STATUS_RANGES = {
  SUCCESS_MIN: 200,
  SUCCESS_MAX: 300,
  CLIENT_ERROR_MIN: 400,
  CLIENT_ERROR_MAX: 500,
  SERVER_ERROR_MIN: 500,
  SERVER_ERROR_MAX: 600,
} as const;

/**
 * HTTP Security Headers
 *
 * Standard security headers applied to HTTP responses.
 */
export const HTTP_HEADERS = {
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
  X_FRAME_OPTIONS: 'X-Frame-Options',
  X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
  PERMISSIONS_POLICY: 'Permissions-Policy',
  RETRY_AFTER: 'Retry-After',
} as const;

/**
 * HTTP Header Values
 *
 * Common values for HTTP headers.
 */
export const HTTP_HEADER_VALUES = {
  X_FRAME_OPTIONS_DENY: 'DENY',
  X_CONTENT_TYPE_OPTIONS_NOSNIFF: 'nosniff',
} as const;
