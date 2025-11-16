import { ErrorCategory, ErrorClassification } from '@/types/errors';

/**
 * Error classifier that categorizes errors based on HTTP status codes,
 * error messages, and error types to determine appropriate handling strategies.
 */
export class ErrorClassifier {
  /**
   * Classifies an error into a category with retry information.
   *
   * @param error - The error to classify (can be Error, Response, or unknown)
   * @returns ErrorClassification with category, retryable status, and optional status code
   *
   * @example
   * ```typescript
   * const classification = ErrorClassifier.classify(error);
   * if (classification.retryable) {
   *   // Implement retry logic
   * }
   * ```
   */
  static classify(error: unknown): ErrorClassification {
    // Handle HTTP Response objects (from fetch API)
    // These have a status property that directly indicates the error type
    if (error instanceof Response) {
      return this.classifyHttpResponse(error);
    }

    // Handle Error objects (standard JavaScript errors)
    // These require message parsing to determine the error type
    if (error instanceof Error) {
      return this.classifyErrorObject(error);
    }

    // Handle plain objects with status codes (from axios, node-fetch, etc.)
    // Different HTTP libraries structure errors differently, so we check multiple patterns
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;

      // Check for direct status code properties (axios pattern)
      if ('statusCode' in errorObj || 'status' in errorObj) {
        const statusCode = (errorObj.statusCode || errorObj.status) as number;
        return this.classifyByStatusCode(statusCode);
      }

      // Check for nested response object (axios error pattern)
      if ('response' in errorObj) {
        const response = errorObj.response as Record<string, unknown>;
        if ('status' in response) {
          return this.classifyByStatusCode(response.status as number);
        }
      }
    }

    // Default to transient error for unknown types
    // This is a safe default that allows retries for unexpected error formats
    return {
      category: ErrorCategory.TRANSIENT,
      retryable: true,
    };
  }

  /**
   * Classifies HTTP Response objects based on status code.
   *
   * @param response - HTTP Response object to classify
   * @returns ErrorClassification with category and retry information
   *
   * @private
   */
  private static classifyHttpResponse(response: Response): ErrorClassification {
    return this.classifyByStatusCode(response.status);
  }

  /**
   * Classifies Error objects based on message content and properties.
   * Analyzes error messages for keywords indicating network issues, authentication,
   * authorization, rate limiting, and other error types.
   *
   * @param error - Error object to classify
   * @returns ErrorClassification with category and retry information
   *
   * @private
   */
  private static classifyErrorObject(error: Error): ErrorClassification {
    const message = error.message.toLowerCase();

    // Network-related errors (transient) - these indicate temporary connectivity issues
    // Common patterns: ECONNREFUSED (connection refused), ENOTFOUND (DNS lookup failed),
    // ECONNRESET (connection reset by peer), timeouts, and generic network errors
    // These should be retried as they often resolve themselves
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('econnreset') ||
      message.includes('fetch failed') ||
      message.includes('connection refused')
    ) {
      return {
        category: ErrorCategory.TRANSIENT,
        retryable: true,
      };
    }

    // Authentication errors - credentials are invalid or expired
    // These require user intervention (re-authentication) and should not be retried
    if (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('invalid credentials') ||
      message.includes('token expired')
    ) {
      return {
        category: ErrorCategory.AUTHENTICATION,
        retryable: false,
        statusCode: 401,
      };
    }

    // Authorization errors - user lacks necessary permissions
    // These require RBAC configuration changes and should not be retried
    if (
      message.includes('forbidden') ||
      message.includes('permission denied') ||
      message.includes('access denied') ||
      message.includes('insufficient permissions')
    ) {
      return {
        category: ErrorCategory.AUTHORIZATION,
        retryable: false,
        statusCode: 403,
      };
    }

    // Rate limit errors - too many requests sent too quickly
    // These are transient and should be retried after a delay
    if (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('throttled')
    ) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        retryable: true,
        statusCode: 429,
      };
    }

    // Not found errors - resource doesn't exist
    // These are permanent and should not be retried
    if (message.includes('not found') || message.includes('404')) {
      return {
        category: ErrorCategory.PERMANENT,
        retryable: false,
        statusCode: 404,
      };
    }

    // Default to transient for unknown errors
    // This is a safe default that allows retries for unexpected error messages
    return {
      category: ErrorCategory.TRANSIENT,
      retryable: true,
    };
  }

  /**
   * Classifies errors based on HTTP status code.
   * Maps standard HTTP status codes to error categories:
   * - 2xx: Success (shouldn't be an error)
   * - 400: Bad Request (permanent)
   * - 401: Unauthorized (authentication)
   * - 403: Forbidden (authorization)
   * - 404: Not Found (permanent)
   * - 429: Too Many Requests (rate limit)
   * - 4xx: Other client errors (permanent)
   * - 5xx: Server errors (transient)
   *
   * @param statusCode - HTTP status code to classify
   * @returns ErrorClassification with category and retry information
   *
   * @private
   */
  private static classifyByStatusCode(statusCode: number): ErrorClassification {
    // 2xx - Success (shouldn't be classified as error, but handle gracefully)
    if (statusCode >= 200 && statusCode < 300) {
      return {
        category: ErrorCategory.PERMANENT,
        retryable: false,
        statusCode,
      };
    }

    // 400 - Bad Request (permanent)
    if (statusCode === 400) {
      return {
        category: ErrorCategory.PERMANENT,
        retryable: false,
        statusCode,
      };
    }

    // 401 - Unauthorized (authentication)
    if (statusCode === 401) {
      return {
        category: ErrorCategory.AUTHENTICATION,
        retryable: false,
        statusCode,
      };
    }

    // 403 - Forbidden (authorization)
    if (statusCode === 403) {
      return {
        category: ErrorCategory.AUTHORIZATION,
        retryable: false,
        statusCode,
      };
    }

    // 404 - Not Found (permanent)
    if (statusCode === 404) {
      return {
        category: ErrorCategory.PERMANENT,
        retryable: false,
        statusCode,
      };
    }

    // 429 - Too Many Requests (rate limit)
    if (statusCode === 429) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        retryable: true,
        statusCode,
      };
    }

    // 4xx - Other client errors (permanent)
    if (statusCode >= 400 && statusCode < 500) {
      return {
        category: ErrorCategory.PERMANENT,
        retryable: false,
        statusCode,
      };
    }

    // 500 - Internal Server Error (transient)
    if (statusCode === 500) {
      return {
        category: ErrorCategory.TRANSIENT,
        retryable: true,
        statusCode,
      };
    }

    // 502 - Bad Gateway (transient)
    if (statusCode === 502) {
      return {
        category: ErrorCategory.TRANSIENT,
        retryable: true,
        statusCode,
      };
    }

    // 503 - Service Unavailable (transient)
    if (statusCode === 503) {
      return {
        category: ErrorCategory.TRANSIENT,
        retryable: true,
        statusCode,
      };
    }

    // 504 - Gateway Timeout (transient)
    if (statusCode === 504) {
      return {
        category: ErrorCategory.TRANSIENT,
        retryable: true,
        statusCode,
      };
    }

    // 5xx - Other server errors (transient)
    if (statusCode >= 500 && statusCode < 600) {
      return {
        category: ErrorCategory.TRANSIENT,
        retryable: true,
        statusCode,
      };
    }

    // Unknown status code - treat as transient
    return {
      category: ErrorCategory.TRANSIENT,
      retryable: true,
      statusCode,
    };
  }

  /**
   * Gets a user-friendly error message based on error classification.
   *
   * @param classification - The error classification
   * @returns User-friendly error message
   */
  static getUserMessage(classification: ErrorClassification): string {
    switch (classification.category) {
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials and try again.';

      case ErrorCategory.AUTHORIZATION:
        return "You don't have permission to access this resource. Please contact your administrator.";

      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';

      case ErrorCategory.PERMANENT:
        if (classification.statusCode === 404) {
          return 'The requested resource was not found.';
        }
        return 'An error occurred while processing your request.';

      case ErrorCategory.TRANSIENT:
        return 'A temporary error occurred. Please try again.';

      default:
        return 'An unexpected error occurred.';
    }
  }

  /**
   * Gets the appropriate documentation link based on error classification.
   *
   * @param classification - The error classification
   * @returns Documentation URL
   */
  static getDocumentationLink(classification: ErrorClassification): string {
    const baseUrl = 'https://wasilak.github.io/kube-ingress-dash';

    switch (classification.category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return `${baseUrl}/architecture/rbac-setup`;

      case ErrorCategory.RATE_LIMIT:
        return `${baseUrl}/architecture/interaction-with-kubernetes`;

      case ErrorCategory.PERMANENT:
      case ErrorCategory.TRANSIENT:
      default:
        return baseUrl;
    }
  }

  /**
   * Gets user-friendly documentation link text based on error classification.
   *
   * @param classification - The error classification
   * @returns Documentation link text
   */
  static getDocumentationText(classification: ErrorClassification): string {
    switch (classification.category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return 'View RBAC Setup Guide';

      case ErrorCategory.RATE_LIMIT:
        return 'View API Documentation';

      case ErrorCategory.PERMANENT:
      case ErrorCategory.TRANSIENT:
      default:
        return 'View Documentation';
    }
  }
}
