import { ErrorClassifier } from './classifier';

/**
 * Configuration options for the retry handler
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts (including the initial attempt)
   * @default 3
   */
  maxAttempts: number;

  /**
   * Initial delay in milliseconds before the first retry
   * @default 100
   */
  initialDelayMs: number;

  /**
   * Maximum delay in milliseconds between retries
   * @default 5000
   */
  maxDelayMs: number;

  /**
   * Multiplier for exponential backoff
   * @default 2
   */
  backoffMultiplier: number;
}

/**
 * Default retry configuration with exponential backoff: 100ms, 200ms, 400ms
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Retry handler that implements exponential backoff for transient errors.
 * Only retries errors classified as transient by the ErrorClassifier.
 * 
 * @example
 * ```typescript
 * const retryHandler = new RetryHandler({
 *   maxAttempts: 3,
 *   initialDelayMs: 100,
 *   maxDelayMs: 5000,
 *   backoffMultiplier: 2,
 * });
 * 
 * const result = await retryHandler.execute(async () => {
 *   return await fetchData();
 * });
 * ```
 */
export class RetryHandler {
  private config: RetryConfig;

  /**
   * Creates a new RetryHandler instance
   * 
   * @param config - Retry configuration options (optional, uses defaults if not provided)
   */
  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      ...DEFAULT_RETRY_CONFIG,
      ...config,
    };
  }

  /**
   * Executes an async function with retry logic and exponential backoff.
   * Only retries errors classified as transient.
   * 
   * @param fn - The async function to execute
   * @returns Promise resolving to the function's return value
   * @throws The last error if all retry attempts fail
   * 
   * @example
   * ```typescript
   * const data = await retryHandler.execute(async () => {
   *   const response = await fetch('/api/data');
   *   if (!response.ok) throw new Error('Request failed');
   *   return response.json();
   * });
   * ```
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    let attempt = 0;

    while (attempt < this.config.maxAttempts) {
      try {
        attempt++;
        
        // Execute the function
        const result = await fn();
        
        // Success - return the result
        return result;
      } catch (error) {
        lastError = error;

        // Classify the error to determine if it's retryable
        const classification = ErrorClassifier.classify(error);

        // If this is the last attempt or error is not retryable, throw immediately
        if (attempt >= this.config.maxAttempts || !classification.retryable) {
          throw error;
        }

        // Calculate delay for next retry using exponential backoff
        const delay = this.calculateDelay(attempt);

        // Log retry attempt (in production, this would use a proper logger)
        if (process.env.NODE_ENV !== 'test') {
          console.warn(
            `Retry attempt ${attempt}/${this.config.maxAttempts} after ${delay}ms`,
            {
              error: error instanceof Error ? error.message : String(error),
              category: classification.category,
              statusCode: classification.statusCode,
            }
          );
        }

        // Wait before retrying
        await this.delay(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError;
  }

  /**
   * Calculates the delay for a retry attempt using exponential backoff.
   * 
   * @param attempt - The current attempt number (1-indexed)
   * @returns Delay in milliseconds
   * 
   * @example
   * With initialDelayMs=100, backoffMultiplier=2:
   * - Attempt 1: 100ms
   * - Attempt 2: 200ms
   * - Attempt 3: 400ms
   */
  private calculateDelay(attempt: number): number {
    // Calculate exponential backoff: initialDelay * (multiplier ^ (attempt - 1))
    const exponentialDelay =
      this.config.initialDelayMs *
      Math.pow(this.config.backoffMultiplier, attempt - 1);

    // Cap at maxDelayMs
    return Math.min(exponentialDelay, this.config.maxDelayMs);
  }

  /**
   * Delays execution for the specified number of milliseconds.
   * 
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Gets the current retry configuration.
   * 
   * @returns Current retry configuration
   */
  getConfig(): Readonly<RetryConfig> {
    return { ...this.config };
  }
}
