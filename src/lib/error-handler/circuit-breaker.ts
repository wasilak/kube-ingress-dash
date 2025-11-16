import { ErrorClassifier } from './classifier';
import { KUBERNETES_CIRCUIT_BREAKER, KUBERNETES_TIMEOUTS } from '@/constants/kubernetes';

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
  failureThreshold: KUBERNETES_CIRCUIT_BREAKER.FAILURE_THRESHOLD, // 50% failure rate
  successThreshold: KUBERNETES_CIRCUIT_BREAKER.SUCCESS_THRESHOLD,
  timeout: KUBERNETES_TIMEOUTS.CIRCUIT_BREAKER_TIMEOUT, // 60 seconds
  windowMs: KUBERNETES_TIMEOUTS.CIRCUIT_BREAKER_WINDOW, // 30 seconds
};

/**
 * Circuit breaker error thrown when circuit is open
 */
/**
 * Error thrown when circuit breaker is in OPEN state.
 * Indicates that the protected service is experiencing failures and requests are being rejected
 * to prevent cascading failures and allow the service time to recover.
 *
 * @example
 * ```typescript
 * try {
 *   await circuitBreaker.execute(() => fetchData());
 * } catch (error) {
 *   if (error instanceof CircuitBreakerOpenError) {
 *     console.log('Service temporarily unavailable, using cached data');
 *   }
 * }
 * ```
 */
export class CircuitBreakerOpenError extends Error {
  /**
   * Creates a new CircuitBreakerOpenError instance.
   *
   * @param message - Error message describing the circuit breaker state
   */
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
    // Check if enough time has elapsed to transition from OPEN to HALF_OPEN state
    // This allows the circuit breaker to test if the service has recovered
    this.checkStateTransition();

    // Fast-fail: If circuit is OPEN, reject immediately without calling the function
    // This prevents overwhelming a failing service and gives it time to recover
    if (this.state === CircuitState.OPEN) {
      throw new CircuitBreakerOpenError(
        `Circuit breaker is open. Service will be retried after ${this.getRemainingTimeout()}ms`
      );
    }

    try {
      // Execute the protected function
      const result = await fn();

      // Record successful execution to update circuit breaker state
      // In HALF_OPEN state, this may close the circuit if threshold is met
      this.recordSuccess();

      return result;
    } catch (error) {
      // Classify the error to determine if it indicates service health issues
      // This prevents permanent errors (404, 400) from triggering circuit breaker
      const classification = ErrorClassifier.classify(error);

      // Only count transient errors and rate limits as failures for circuit breaker
      // Permanent errors (like 404, 400) don't indicate service health issues
      // Rate limit errors are transient and should count toward failure threshold
      if (classification.category === 'transient' || classification.category === 'rate_limit') {
        this.recordFailure();
      }

      // Always re-throw the original error so caller can handle it appropriately
      throw error;
    }
  }

  /**
   * Records a successful request and updates circuit breaker state.
   * In HALF_OPEN state, increments success count and may close the circuit.
   * In CLOSED state, adds success to request history.
   *
   * @private
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
   * Records a failed request and updates circuit breaker state.
   * In HALF_OPEN state, any failure reopens the circuit.
   * In CLOSED state, adds failure to history and checks if threshold is exceeded.
   *
   * @private
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
   * Removes entries outside the sliding window to maintain accurate failure rate calculation.
   *
   * @param now - Current timestamp in milliseconds
   *
   * @private
   */
  private cleanupHistory(now: number): void {
    const cutoff = now - this.config.windowMs;
    this.requestHistory = this.requestHistory.filter((result) => result.timestamp > cutoff);
  }

  /**
   * Checks if failure threshold is exceeded and opens circuit if needed.
   * Calculates failure rate from request history and compares against configured threshold.
   *
   * @private
   */
  private checkFailureThreshold(): void {
    // No data to analyze - circuit remains closed
    if (this.requestHistory.length === 0) {
      return;
    }

    // Calculate failure rate from the sliding window of recent requests
    // This provides a real-time view of service health
    const failures = this.requestHistory.filter((r) => !r.success).length;
    const total = this.requestHistory.length;
    const failureRate = failures / total;

    // Open the circuit if failure rate exceeds threshold (default 50%)
    // This prevents cascading failures by stopping requests to the failing service
    if (failureRate >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Checks if circuit should transition from OPEN to HALF_OPEN.
   * Transitions when the configured timeout has elapsed since circuit opened.
   *
   * @private
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
   * Transitions the circuit breaker to a new state and resets relevant counters.
   * Logs state transitions for observability.
   *
   * @param newState - The new circuit state to transition to
   *
   * @private
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    // Reset state-specific counters and timestamps based on the new state
    if (newState === CircuitState.OPEN) {
      // Circuit opened due to high failure rate
      // Record timestamp to track when we can transition to HALF_OPEN
      this.openTimestamp = Date.now();
      this.halfOpenSuccessCount = 0;
    } else if (newState === CircuitState.CLOSED) {
      // Circuit closed - service is healthy
      // Clear all tracking data for a fresh start
      this.openTimestamp = null;
      this.halfOpenSuccessCount = 0;
      this.requestHistory = [];
    } else if (newState === CircuitState.HALF_OPEN) {
      // Testing if service has recovered
      // Reset success counter to track test requests
      this.halfOpenSuccessCount = 0;
    }

    // Log state transition for observability (in production, use structured logging)
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
