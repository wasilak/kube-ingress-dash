import { IngressStream, IngressEvent } from './ingress-stream';
import { KUBERNETES_TIMEOUTS } from '@/constants/kubernetes';

/**
 * Event emitted by the multi-namespace stream manager
 * Includes the namespace context for each event
 */
export interface MultiNamespaceEvent extends IngressEvent {
  namespace: string;
  timestamp: string;
}

/**
 * Represents a single namespace watch connection
 */
interface NamespaceWatch {
  namespace: string;
  stream: IngressStream;
  active: boolean;
  reconnectAttempts: number;
  reconnectTimer?: NodeJS.Timeout;
}

/**
 * Manages parallel watch connections for multiple Kubernetes namespaces
 * and aggregates events from all watchers into a single stream.
 *
 * This class enables monitoring ingresses across multiple namespaces simultaneously,
 * with isolated error handling per namespace to prevent cascading failures.
 *
 * @example
 * ```typescript
 * const manager = new MultiNamespaceStreamManager();
 *
 * manager.onEvent((event) => {
 *   console.log(`Event in ${event.namespace}:`, event.type, event.ingress.name);
 * });
 *
 * manager.onError((error, namespace) => {
 *   console.error(`Error in ${namespace}:`, error);
 * });
 *
 * await manager.startWatching(['default', 'production', 'staging']);
 * ```
 */
export class MultiNamespaceStreamManager {
  private watches: Map<string, NamespaceWatch>;
  private eventHandlers: ((event: MultiNamespaceEvent) => void)[] = [];
  private errorHandlers: ((error: Error, namespace: string) => void)[] = [];
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelayMs: number = KUBERNETES_TIMEOUTS.RECONNECT_DELAY;
  private readonly reconnectBackoffMultiplier: number = 2;

  constructor() {
    this.watches = new Map();
  }

  /**
   * Register a callback to receive events from all watched namespaces
   *
   * @param callback - Function to call when an ingress event occurs in any namespace
   */
  onEvent(callback: (event: MultiNamespaceEvent) => void): void {
    this.eventHandlers.push(callback);
  }

  /**
   * Register a callback to receive errors from namespace watches
   *
   * @param callback - Function to call when an error occurs, includes namespace context
   */
  onError(callback: (error: Error, namespace: string) => void): void {
    this.errorHandlers.push(callback);
  }

  /**
   * Remove an event handler
   *
   * @param callback - The event handler to remove
   */
  removeEventHandler(callback: (event: MultiNamespaceEvent) => void): void {
    this.eventHandlers = this.eventHandlers.filter((h) => h !== callback);
  }

  /**
   * Remove an error handler
   *
   * @param callback - The error handler to remove
   */
  removeErrorHandler(callback: (error: Error, namespace: string) => void): void {
    this.errorHandlers = this.errorHandlers.filter((h) => h !== callback);
  }

  /**
   * Start watching ingresses in multiple namespaces in parallel
   *
   * Creates separate watch connections for each namespace. If a watch already exists
   * for a namespace, it will be reused. Failures in one namespace do not affect others.
   *
   * @param namespaces - Array of namespace names to watch
   * @throws {Error} If namespaces array is empty
   *
   * @example
   * ```typescript
   * await manager.startWatching(['default', 'production']);
   * ```
   */
  async startWatching(namespaces: string[]): Promise<void> {
    if (!namespaces || namespaces.length === 0) {
      throw new Error('At least one namespace must be provided');
    }

    // Start watching each namespace in parallel
    const watchPromises = namespaces.map((namespace) => this.startWatchingNamespace(namespace));

    // Wait for all watches to start (but don't fail if some fail)
    await Promise.allSettled(watchPromises);
  }

  /**
   * Start watching a single namespace
   *
   * @param namespace - The namespace to watch
   */
  private async startWatchingNamespace(namespace: string): Promise<void> {
    // Check if already watching this namespace
    if (this.watches.has(namespace)) {
      const watch = this.watches.get(namespace)!;
      if (watch.active) {
        console.log(`Already watching namespace: ${namespace}`);
        return;
      }
    }

    try {
      // Create a new stream for this namespace with auto-reconnect disabled
      // (we handle reconnection at the multi-namespace level)
      const stream = new IngressStream({ autoReconnect: false });

      // Set up event handler for this namespace
      stream.addEventHandler((event: IngressEvent) => {
        this.handleNamespaceEvent(namespace, event);
      });

      // Set up error handler for this namespace
      stream.addErrorHandler((error: Error) => {
        this.handleNamespaceError(namespace, error);
      });

      // Start watching the namespace
      await stream.startWatching(namespace);

      // Store the watch
      this.watches.set(namespace, {
        namespace,
        stream,
        active: true,
        reconnectAttempts: 0,
      });

      console.log(`Started watching namespace: ${namespace}`);
    } catch (error) {
      console.error(`Failed to start watching namespace ${namespace}:`, error);
      this.emitError(error as Error, namespace);

      // Schedule reconnection attempt for this namespace
      this.scheduleReconnection(namespace);

      // Don't throw - allow other namespaces to continue
    }
  }

  /**
   * Stop watching ingresses in specific namespaces
   *
   * Terminates watch connections for the specified namespaces. Other namespace
   * watches continue unaffected.
   *
   * @param namespaces - Array of namespace names to stop watching
   *
   * @example
   * ```typescript
   * manager.stopWatching(['staging']); // Stop watching staging, keep others
   * ```
   */
  stopWatching(namespaces: string[]): void {
    for (const namespace of namespaces) {
      const watch = this.watches.get(namespace);
      if (watch) {
        try {
          // Cancel any pending reconnection attempts
          this.cancelReconnection(namespace);

          // Stop the stream
          watch.stream.stopWatching();
          watch.active = false;
          this.watches.delete(namespace);
          console.log(`Stopped watching namespace: ${namespace}`);
        } catch (error) {
          console.error(`Error stopping watch for namespace ${namespace}:`, error);
          this.emitError(error as Error, namespace);
        }
      }
    }
  }

  /**
   * Stop watching all namespaces
   *
   * Terminates all active watch connections and clears the watch map.
   */
  stopAll(): void {
    const namespaces = Array.from(this.watches.keys());
    this.stopWatching(namespaces);
  }

  /**
   * Update the set of watched namespaces
   *
   * Efficiently handles namespace selection changes by:
   * - Starting watches for newly selected namespaces
   * - Stopping watches for deselected namespaces
   * - Keeping existing watches for unchanged namespaces
   *
   * @param namespaces - New array of namespace names to watch
   *
   * @example
   * ```typescript
   * // Initially watching: ['default', 'production']
   * await manager.updateNamespaces(['default', 'staging']);
   * // Now watching: ['default', 'staging']
   * // Stopped: ['production'], Started: ['staging'], Kept: ['default']
   * ```
   */
  async updateNamespaces(namespaces: string[]): Promise<void> {
    // Use Sets for efficient lookup when comparing namespace lists
    const currentNamespaces = new Set(this.watches.keys());
    const newNamespaces = new Set(namespaces);

    // Calculate the diff between current and new namespace selections
    // This allows us to efficiently add/remove only what changed

    // Find namespaces to stop watching (in current but not in new)
    // These are namespaces the user deselected
    const namespacesToStop = Array.from(currentNamespaces).filter((ns) => !newNamespaces.has(ns));

    // Find namespaces to start watching (in new but not in current)
    // These are namespaces the user newly selected
    const namespacesToStart = Array.from(newNamespaces).filter((ns) => !currentNamespaces.has(ns));

    // Stop watches for deselected namespaces
    // This frees up resources and stops unnecessary API calls
    if (namespacesToStop.length > 0) {
      this.stopWatching(namespacesToStop);
    }

    // Start watches for newly selected namespaces
    // This begins streaming events from the new namespaces
    if (namespacesToStart.length > 0) {
      await this.startWatching(namespacesToStart);
    }
  }

  /**
   * Handle an event from a specific namespace watch
   *
   * Optimized for minimal latency - adds timestamp immediately upon receiving
   * the event from Kubernetes to track end-to-end delivery time.
   *
   * @param namespace - The namespace where the event occurred
   * @param event - The ingress event
   */
  private handleNamespaceEvent(namespace: string, event: IngressEvent): void {
    // Add timestamp immediately for accurate latency tracking
    // This timestamp represents when the event was received from Kubernetes
    const eventTimestamp = new Date().toISOString();

    // Create a multi-namespace event with namespace context and timestamp
    // Using object spread for optimal performance
    const multiNamespaceEvent: MultiNamespaceEvent = {
      ...event,
      namespace,
      timestamp: eventTimestamp,
    };

    // Emit to all registered event handlers with minimal overhead
    this.emitEvent(multiNamespaceEvent);
  }

  /**
   * Handle an error from a specific namespace watch
   *
   * Errors are isolated per namespace - a failure in one namespace
   * does not affect watches in other namespaces. Automatically schedules
   * reconnection attempts with exponential backoff.
   *
   * @param namespace - The namespace where the error occurred
   * @param error - The error that occurred
   */
  private handleNamespaceError(namespace: string, error: Error): void {
    console.error(`Error in namespace ${namespace}:`, error);

    // Mark the watch as inactive
    const watch = this.watches.get(namespace);
    if (watch) {
      watch.active = false;
    }

    // Emit error to handlers
    this.emitError(error, namespace);

    // Schedule automatic reconnection
    this.scheduleReconnection(namespace);
  }

  /**
   * Emit an event to all registered event handlers
   *
   * Optimized for minimal latency - handlers are called synchronously
   * to ensure events are delivered as quickly as possible.
   *
   * @param event - The event to emit
   */
  private emitEvent(event: MultiNamespaceEvent): void {
    // Call handlers synchronously for minimal latency
    // Error handling ensures one failing handler doesn't affect others
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in multi-namespace event handler:', error);
      }
    }
  }

  /**
   * Emit an error to all registered error handlers
   *
   * @param error - The error to emit
   * @param namespace - The namespace context for the error
   */
  private emitError(error: Error, namespace: string): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error, namespace);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }
  }

  /**
   * Get the list of currently watched namespaces
   *
   * @returns Array of namespace names currently being watched
   */
  getWatchedNamespaces(): string[] {
    return Array.from(this.watches.keys());
  }

  /**
   * Check if a specific namespace is currently being watched
   *
   * @param namespace - The namespace to check
   * @returns True if the namespace is being watched
   */
  isWatchingNamespace(namespace: string): boolean {
    const watch = this.watches.get(namespace);
    return watch !== undefined && watch.active;
  }

  /**
   * Get the total number of active watches
   *
   * @returns Number of namespaces currently being watched
   */
  getActiveWatchCount(): number {
    return Array.from(this.watches.values()).filter((w) => w.active).length;
  }

  /**
   * Schedule a reconnection attempt for a failed namespace watch
   *
   * Uses exponential backoff to avoid overwhelming the Kubernetes API.
   * Stops attempting after maxReconnectAttempts is reached.
   *
   * @param namespace - The namespace to reconnect
   */
  private scheduleReconnection(namespace: string): void {
    const watch = this.watches.get(namespace);

    // If watch doesn't exist or was explicitly stopped, don't reconnect
    // This prevents reconnection attempts for namespaces the user deselected
    if (!watch) {
      return;
    }

    // Check if we've exceeded max reconnection attempts
    // After max attempts, we give up to avoid infinite retry loops
    if (watch.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Max reconnection attempts (${this.maxReconnectAttempts}) reached for namespace ${namespace}. Giving up.`
      );
      this.emitError(
        new Error(
          `Failed to reconnect to namespace ${namespace} after ${this.maxReconnectAttempts} attempts`
        ),
        namespace
      );
      return;
    }

    // Clear any existing reconnection timer to avoid duplicate attempts
    if (watch.reconnectTimer) {
      clearTimeout(watch.reconnectTimer);
    }

    // Calculate delay with exponential backoff: 5s, 10s, 20s, 40s, 80s (with default config)
    // This progressively increases the delay between attempts to avoid overwhelming the API
    // Formula: baseDelay * (multiplier ^ attemptNumber)
    const delay =
      this.reconnectDelayMs * Math.pow(this.reconnectBackoffMultiplier, watch.reconnectAttempts);

    console.log(
      `Scheduling reconnection for namespace ${namespace} in ${delay}ms (attempt ${watch.reconnectAttempts + 1}/${this.maxReconnectAttempts})`
    );

    // Schedule the reconnection attempt using setTimeout
    // This is non-blocking and allows other namespaces to continue working
    watch.reconnectTimer = setTimeout(() => {
      this.attemptReconnection(namespace);
    }, delay);

    // Increment reconnection attempts counter for next time
    watch.reconnectAttempts++;
  }

  /**
   * Attempt to reconnect to a failed namespace watch
   *
   * @param namespace - The namespace to reconnect
   */
  private async attemptReconnection(namespace: string): Promise<void> {
    const watch = this.watches.get(namespace);

    if (!watch) {
      return;
    }

    console.log(`Attempting to reconnect to namespace: ${namespace}`);

    try {
      // Stop the old stream if it exists
      if (watch.stream) {
        try {
          watch.stream.stopWatching();
        } catch (error) {
          console.error(`Error stopping old stream for ${namespace}:`, error);
        }
      }

      // Create a new stream with auto-reconnect disabled
      const stream = new IngressStream({ autoReconnect: false });

      // Set up event handler
      stream.addEventHandler((event: IngressEvent) => {
        this.handleNamespaceEvent(namespace, event);
      });

      // Set up error handler
      stream.addErrorHandler((error: Error) => {
        this.handleNamespaceError(namespace, error);
      });

      // Start watching
      await stream.startWatching(namespace);

      // Update the watch with the new stream
      watch.stream = stream;
      watch.active = true;
      watch.reconnectAttempts = 0; // Reset reconnection attempts on success
      watch.reconnectTimer = undefined;

      console.log(`Successfully reconnected to namespace: ${namespace}`);
    } catch (error) {
      console.error(`Failed to reconnect to namespace ${namespace}:`, error);
      this.emitError(error as Error, namespace);

      // Schedule another reconnection attempt
      this.scheduleReconnection(namespace);
    }
  }

  /**
   * Cancel any pending reconnection attempts for a namespace
   *
   * @param namespace - The namespace to cancel reconnection for
   */
  private cancelReconnection(namespace: string): void {
    const watch = this.watches.get(namespace);
    if (watch?.reconnectTimer) {
      clearTimeout(watch.reconnectTimer);
      watch.reconnectTimer = undefined;
    }
  }
}
