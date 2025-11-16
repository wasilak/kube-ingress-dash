/**
 * Centralized error handling utility
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  source?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export class ErrorHandler {
  /**
   * Handles application errors and logs them appropriately
   */
  static handle(error: Error, source?: string, context?: Record<string, unknown>): ErrorInfo {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      source,
      timestamp: new Date(),
      context,
    };

    // Log error based on environment
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', errorInfo);
    } else {
      // In production, you might send to a logging service
      console.error('App Error:', errorInfo.message, errorInfo.source);
      // Example: send to logging service like Sentry, etc.
      // logger.error(errorInfo);
    }

    return errorInfo;
  }

  /**
   * Handles Kubernetes API specific errors
   */
  static handleKubernetesError(error: unknown, context?: string): ErrorInfo {
    const err = error as { response?: { body?: { message?: string }; statusCode?: number }; message?: string; stack?: string };
    const message = err?.response?.body?.message || err?.message || 'Unknown Kubernetes API error';
    const status = err?.response?.statusCode || 'Unknown';
    
    const errorInfo: ErrorInfo = {
      message: `Kubernetes API Error (${status}): ${message}`,
      stack: err?.stack,
      source: 'Kubernetes API',
      timestamp: new Date(),
      context: {
        ...(context ? { contextInfo: context } : {}),
        statusCode: status,
        response: err?.response?.body,
      },
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('Kubernetes API Error:', errorInfo);
    } else {
      console.error('K8s Error:', errorInfo.message);
    }

    return errorInfo;
  }

  /**
   * Reports error to external service (placeholder)
   */
  static async report(_errorInfo: ErrorInfo): Promise<void> {
    // In a real implementation, this would send errors to a service like Sentry
    // For now, we'll just log to console
    if (process.env.NODE_ENV !== 'development') {
      // Example: await fetch('/api/error-reporting', { method: 'POST', body: JSON.stringify(errorInfo) });
    }
  }
}