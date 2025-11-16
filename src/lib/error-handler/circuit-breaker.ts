import { ErrorClassifier } from './classifier';

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * Configuration options for the circuit breaker
 */
export interface CircuitBreakerConfig {
  /**
   * Failure rate threshold (0-1) that triggers circuit opening
   * @default 0.5 (50%)
   */
  failureThreshold: number;

  /**
   * Number of successful requests needed to close circuit from half-open state
   * @default 1
   */
  successThreshold: number;

  /**
   * Time in milliseconds to wait before transitioning from open to half-open
   * @default 60000 (60 seconds)
   */
  timeout: number;

  /**
   * Time window in milliseconds for tracking failure rate
   * @default 30000 (30 seconds)
   */
  windowMs: number;
}

/**
 * Request result tracked in the sliding window
 */
interface RequestResult {
  success: boolean;
  timestamp: number;
}

/**
 * Default circuit breaker configuration
 */
const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 0.5, // 50% failure rate
  successThreshold: 1,
  timeout: 60000, // 60 seconds
  windowMs: 30000, // 30 seconds
};

/**
 * Circuit breaker error thrown when circuit is open
 */
export class CircuitBreakerOpenError extends Error {
  constructor(message: string = 'Circuit breaker is open') {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Circuit breaker implementation that prevents cascading failures by stopping
 * requests to failing services. Tracks failure rate over a sliding window and
 * opens the circuit when the threshold is exceeded.
 * 
 * States:
 * - CLOSED: Normal operation, all requests pass through
 * - OPEN: Circuit is open, requests fail immediately
 * - HALF_OPEN: Testing if service has recovered
 * 
 * @example
 * ```typescript
 * const circuitBreaker = new CircuitBreaker({
 *   failureThreshold: 0.5,
 *   successThreshold: 1,
 *   timeout: 60000,
 *   windowMs: 30000,
 * });
 * 
 * try {
 *   const result = await circuitBreaker.execute(async () => {
 *     return await fetchData();
 *   });
 * } catch (error) {
 *   if (error instanceof CircuitBreakerOpenError) {
 *     // Circuit is open, use cached data or return error
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private config: CircuitBreakerConfig;
  private requestHistory: RequestResult[] = [];
  private openTimestamp: number | null = null;
  private halfOpenSuccessCount: number = 0;

  /**
   * Creates a new CircuitBreaker instance
   * 
   * @param config - Circuit breaker configuration options (optional, uses defaults if not provided)
   */
  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = {
      ...DEFAULT_CIRCUIT_BREAKER_CONFIG,
      ...config,
    };
  }

  /**
   * Executes an async function with circuit breaker protection.
   * 
   * @param fn - The async function to execute
   * @returns Promise resolving to the function's return value
   * @throws {CircuitBreakerOpenError} When circuit is open
   * @throws The original error if the function fails
   * 
   * @example
   * ```typescript
   * const data = await circuitBreaker.execute(async () => {
   *   const response = await fetch('/api/data');
   *   if (!response.ok) throw new Error('Request failed');
   *   return response.json();
   * });
   * ```
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if we should transition from OPEN to HALF_OPEN
    this.checkStateTransition();

    // If circuit is OPEN, reject immediately
    if (this.state === CircuitState.OPEN) {
      throw new CircuitBreakerOpenError(
        `Circuit breaker is open. Service will be retried after ${this.getRemainingTimeout()}ms`
      );
    }

    try {
      // Execute the function
      const result = await fn();

      // Record success
      this.recordSuccess();

      return result;
    } catch (error) {
      // Classify the error to determine if it should count as a failure
      const classification = ErrorClassifier.classify(error);

      // Only count transient errors as failures for circuit breaker
      // Permanent errors (like 404, 400) don't indicate service health issues
      if (classification.category === 'transient' || classification.category === 'rate_limit') {
        this.recordFailure();
      }

      // Re-throw the original error
      throw error;
    }
  }

  /**
   * Records a successful request
   */
  private recordSuccess(): void {
    const now = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenSuccessCount++;

      // If we've reached the success threshold, close the circuit
      if (this.halfOpenSuccessCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.halfOpenSuccessCount = 0;
        this.requestHistory = [];
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Add success to history
      this.requestHistory.push({
        success: true,
        timestamp: now,
      });

      // Clean up old entries
      this.cleanupHistory(now);
    }
  }

  /**
   * Records a failed request
   */
  private recordFailure(): void {
    const now = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in HALF_OPEN state reopens the circuit
      this.transitionTo(CircuitState.OPEN);
      this.halfOpenSuccessCount = 0;
    } else if (this.state === CircuitState.CLOSED) {
      // Add failure to history
      this.requestHistory.push({
        success: false,
        timestamp: now,
      });

      // Clean up old entries
      this.cleanupHistory(now);

      // Check if we should open the circuit
      this.checkFailureThreshold();
    }
  }

  /**
   * Removes entries outside the sliding window
   */
  private cleanupHistory(now: number): void {
    const cutoff = now - this.config.windowMs;
    this.requestHistory = this.requestHistory.filter(
      (result) => result.timestamp > cutoff
    );
  }

  /**
   * Checks if failure threshold is exceeded and opens circuit if needed
   */
  private checkFailureThreshold(): void {
    if (this.requestHistory.length === 0) {
      return;
    }

    const failures = this.requestHistory.filter((r) => !r.success).length;
    const total = this.requestHistory.length;
    const failureRate = failures / total;

    if (failureRate >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Checks if circuit should transition from OPEN to HALF_OPEN
   */
  private checkStateTransition(): void {
    if (this.state === CircuitState.OPEN && this.openTimestamp !== null) {
      const now = Date.now();
      const elapsed = now - this.openTimestamp;

      if (elapsed >= this.config.timeout) {
        this.transitionTo(CircuitState.HALF_OPEN);
      }
    }
  }

  /**
   * Transitions the circuit breaker to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === CircuitState.OPEN) {
      this.openTimestamp = Date.now();
      this.halfOpenSuccessCount = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.openTimestamp = null;
      this.halfOpenSuccessCount = 0;
      this.requestHistory = [];
    } else if (newState === CircuitState.HALF_OPEN) {
      this.halfOpenSuccessCount = 0;
    }

    // Log state transition (in production, this would use a proper logger)
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Circuit breaker state transition: ${oldState} -> ${newState}`);
    }
  }

  /**
   * Gets the current circuit breaker state
   * 
   * @returns Current circuit state
   */
  getState(): CircuitState {
    // Check for state transition before returning state
    this.checkStateTransition();
    return this.state;
  }

  /**
   * Gets the current failure rate in the sliding window
   * 
   * @returns Failure rate (0-1)
   */
  getFailureRate(): number {
    if (this.requestHistory.length === 0) {
      return 0;
    }

    const failures = this.requestHistory.filter((r) => !r.success).length;
    return failures / this.requestHistory.length;
  }

  /**
   * Gets the number of requests in the current sliding window
   * 
   * @returns Number of requests
   */
  getRequestCount(): number {
    return this.requestHistory.length;
  }

  /**
   * Gets the remaining time until circuit transitions to HALF_OPEN
   * 
   * @returns Remaining time in milliseconds, or 0 if not in OPEN state
   */
  getRemainingTimeout(): number {
    if (this.state !== CircuitState.OPEN || this.openTimestamp === null) {
      return 0;
    }

    const elapsed = Date.now() - this.openTimestamp;
    const remaining = this.config.timeout - elapsed;
    return Math.max(0, remaining);
  }

  /**
   * Gets the current circuit breaker configuration
   * 
   * @returns Current configuration
   */
  getConfig(): Readonly<CircuitBreakerConfig> {
    return { ...this.config };
  }

  /**
   * Resets the circuit breaker to initial state
   * Useful for testing or manual intervention
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.requestHistory = [];
    this.openTimestamp = null;
    this.halfOpenSuccessCount = 0;
  }
}
