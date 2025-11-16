import { ErrorClassifier } from './error-handler/classifier';
import { ErrorCategory } from '@/types/errors';

// Re-export for convenience
export { RetryHandler } from './error-handler/retry';
export type { RetryConfig } from './error-handler/retry';

// Global error handling utility
export class ErrorHandler {
  static handle(error: unknown, context?: string): void {
    const classification = ErrorClassifier.classify(error);
    
    console.error(`Error in ${context || 'unknown context'}:`, {
      error,
      category: classification.category,
      retryable: classification.retryable,
      statusCode: classification.statusCode,
    });
    
    // Log to external service if configured (e.g., Sentry, LogRocket)
    // In a real application, you would send this to an error tracking service
    if (typeof window !== 'undefined') {
      // Client-side error
      console.error('Client-side error:', error);
    } else {
      // Server-side error
      console.error('Server-side error:', error);
    }
  }

  static formatError(error: unknown): string {
    const classification = ErrorClassifier.classify(error);
    const userMessage = ErrorClassifier.getUserMessage(classification);
    
    if (error instanceof Error) {
      return `${userMessage} (${error.message})`;
    } else if (typeof error === 'string') {
      return `${userMessage} (${error})`;
    }
    return userMessage;
  }

  static isKubernetesError(error: unknown): boolean {
    // Check if the error is related to Kubernetes API
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      'body' in error
    );
  }

  static isRetryable(error: unknown): boolean {
    const classification = ErrorClassifier.classify(error);
    return classification.retryable;
  }

  static getErrorCategory(error: unknown): ErrorCategory {
    const classification = ErrorClassifier.classify(error);
    return classification.category;
  }
}

// Error boundary for API calls
export const withErrorHandling = async <T,>(
  apiCall: () => Promise<T>,
  context?: string
): Promise<T | null> => {
  try {
    return await apiCall();
  } catch (error) {
    ErrorHandler.handle(error, context);
    return null;
  }
};