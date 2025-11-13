// Global error handling utility
export class ErrorHandler {
  static handle(error: unknown, context?: string): void {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
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
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    }
    return 'An unknown error occurred';
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