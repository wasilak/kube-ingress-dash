/**
 * Error category enumeration for classifying different types of errors
 */
export enum ErrorCategory {
  TRANSIENT = 'transient',
  PERMANENT = 'permanent',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
}

/**
 * Base interface for all error types
 */
interface BaseError {
  message: string;
  category: ErrorCategory;
  retryable: boolean;
}

/**
 * Network error - typically transient and retryable
 */
export interface NetworkError extends BaseError {
  type: 'network';
  category: ErrorCategory.TRANSIENT;
  retryable: true;
}

/**
 * Authentication error - credentials are invalid or missing
 */
export interface AuthenticationError extends BaseError {
  type: 'authentication';
  category: ErrorCategory.AUTHENTICATION;
  retryable: false;
  statusCode: 401;
}

/**
 * Authorization error - user lacks required permissions
 */
export interface AuthorizationError extends BaseError {
  type: 'authorization';
  category: ErrorCategory.AUTHORIZATION;
  retryable: false;
  statusCode: 403;
}

/**
 * Not found error - requested resource does not exist
 */
export interface NotFoundError extends BaseError {
  type: 'not_found';
  category: ErrorCategory.PERMANENT;
  retryable: false;
  statusCode: 404;
}

/**
 * Rate limit error - too many requests, should retry after delay
 */
export interface RateLimitError extends BaseError {
  type: 'rate_limit';
  category: ErrorCategory.RATE_LIMIT;
  retryable: true;
  retryAfter: number;
}

/**
 * Server error - typically transient and retryable
 */
export interface ServerError extends BaseError {
  type: 'server_error';
  category: ErrorCategory.TRANSIENT;
  retryable: true;
  statusCode: 500;
}

/**
 * Discriminated union of all possible API error types
 */
export type ApiError =
  | NetworkError
  | AuthenticationError
  | AuthorizationError
  | NotFoundError
  | RateLimitError
  | ServerError;

/**
 * Error classification result
 */
export interface ErrorClassification {
  category: ErrorCategory;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Error information for logging and handling
 */
export interface ErrorInfo {
  message: string;
  status?: number | string;
  source?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}
