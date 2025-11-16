import {
  KubeConfig,
  CoreV1Api,
  NetworkingV1Api,
  V1Ingress,
  V1NamespaceList,
} from '@kubernetes/client-node';
import { IngressData } from '@/types/ingress';
import { transformIngress, transformIngresses } from '@/lib/utils/ingress-transformer';
import { RetryHandler, CircuitBreaker, CircuitBreakerOpenError } from '@/lib/error-handler';
import { KUBERNETES_RETRY, KUBERNETES_TIMEOUTS } from '@/constants/kubernetes';
import { HTTP_STATUS } from '@/constants/http';

/**
 * Kubernetes client for interacting with the Kubernetes API.
 * Provides methods for fetching and watching ingress resources and namespaces.
 * Includes built-in retry logic with exponential backoff and circuit breaker pattern
 * for resilience against transient failures.
 *
 * @example
 * ```typescript
 * const client = new KubernetesClient();
 *
 * // Fetch all ingresses
 * const ingresses = await client.getIngresses();
 *
 * // Watch for changes
 * await client.watchIngresses(
 *   (type, ingress) => console.log(`${type}: ${ingress.name}`),
 *   () => console.log('Watch closed'),
 *   (err) => console.error('Watch error:', err)
 * );
 * ```
 */
class KubernetesClient {
  public kubeConfig: KubeConfig;
  public networkingV1Api: NetworkingV1Api;
  public coreV1Api: CoreV1Api;
  private retryHandler: RetryHandler;
  private circuitBreaker: CircuitBreaker;

  /**
   * Creates a new KubernetesClient instance.
   * Automatically configures the client based on the environment:
   * - In production or when running in-cluster: loads in-cluster configuration
   * - In development: loads configuration from default kubeconfig file
   *
   * Initializes retry handler with exponential backoff (100ms, 200ms, 400ms) and
   * circuit breaker with 50% failure threshold over 30-second window.
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * console.log('Kubernetes client initialized');
   * ```
   */
  constructor() {
    this.kubeConfig = new KubeConfig();

    // Load Kubernetes configuration based on deployment environment
    // In-cluster: Uses service account token mounted at /var/run/secrets/kubernetes.io/serviceaccount/
    // Out-of-cluster: Uses kubeconfig file from ~/.kube/config or KUBECONFIG env var
    if (process.env.NODE_ENV === 'production' || this.isInCluster()) {
      // In-cluster configuration - running inside a Kubernetes pod
      // Automatically uses the pod's service account credentials
      this.kubeConfig.loadFromCluster();
    } else {
      // Out-of-cluster configuration - running locally for development
      // Loads from default kubeconfig file location
      this.kubeConfig.loadFromDefault();
    }

    // Initialize the Kubernetes API clients for different resource types
    // NetworkingV1Api: For ingress resources
    // CoreV1Api: For namespaces and other core resources
    this.networkingV1Api = this.kubeConfig.makeApiClient(NetworkingV1Api);
    this.coreV1Api = this.kubeConfig.makeApiClient(CoreV1Api);

    // Initialize retry handler with exponential backoff strategy
    // Retries: 3 attempts with delays of 100ms, 200ms, 400ms
    // This handles transient network issues and temporary API unavailability
    this.retryHandler = new RetryHandler({
      maxAttempts: KUBERNETES_RETRY.MAX_ATTEMPTS,
      initialDelayMs: KUBERNETES_RETRY.INITIAL_DELAY,
      maxDelayMs: KUBERNETES_RETRY.MAX_DELAY,
      backoffMultiplier: KUBERNETES_RETRY.BACKOFF_MULTIPLIER,
    });

    // Initialize circuit breaker to prevent cascading failures
    // Opens circuit at 50% failure rate over 30-second window
    // Waits 60 seconds before testing if service has recovered
    // This protects both our app and the Kubernetes API from overload
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 0.5, // Open circuit at 50% failure rate
      successThreshold: 1, // Close after 1 successful request in half-open state
      timeout: KUBERNETES_TIMEOUTS.CIRCUIT_BREAKER_TIMEOUT, // Wait 60 seconds before trying again
      windowMs: KUBERNETES_TIMEOUTS.CIRCUIT_BREAKER_WINDOW, // Track failures over 30 second window
    });
  }

  /**
   * Check if the application is running inside a Kubernetes cluster.
   * Determines the environment by checking for the presence of Kubernetes service host environment variable.
   *
   * @returns True if running inside a Kubernetes cluster, false otherwise
   *
   * @private
   */
  private isInCluster(): boolean {
    // Check for the presence of the service account token file
    try {
      // The service account token file path is typically mounted in-cluster
      // const tokenPath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
      return typeof process.env.KUBERNETES_SERVICE_HOST !== 'undefined';
    } catch (_error) {
      return false;
    }
  }

  /**
   * Get all ingresses from all namespaces and transform them to IngressData format.
   * Uses circuit breaker and retry logic for resilience.
   *
   * @returns Promise resolving to array of ingress data from all namespaces
   * @throws {CircuitBreakerOpenError} When circuit breaker is open due to repeated failures
   * @throws {Error} When Kubernetes API request fails after all retry attempts
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * const ingresses = await client.getIngresses();
   * console.log(`Found ${ingresses.length} ingresses across all namespaces`);
   * ```
   */
  async getIngresses(): Promise<IngressData[]> {
    try {
      const response = await this.circuitBreaker.execute(async () => {
        return await this.retryHandler.execute(async () => {
          return await this.networkingV1Api.listIngressForAllNamespaces();
        });
      });
      const k8sIngresses = response.items;

      // Transform Kubernetes ingress objects to our format
      return transformIngresses(k8sIngresses);
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        console.error('Circuit breaker is open - Kubernetes API is unavailable:', error.message);
      } else {
        console.error('Error fetching ingresses:', error);
      }
      throw error;
    }
  }

  /**
   * Get ingresses from a specific namespace.
   * Uses circuit breaker and retry logic for resilience.
   *
   * @param namespace - The Kubernetes namespace to query
   * @returns Promise resolving to array of ingress data from the specified namespace
   * @throws {CircuitBreakerOpenError} When circuit breaker is open due to repeated failures
   * @throws {Error} When Kubernetes API request fails after all retry attempts
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * const ingresses = await client.getIngressesByNamespace('production');
   * console.log(`Found ${ingresses.length} ingresses in production namespace`);
   * ```
   */
  async getIngressesByNamespace(namespace: string): Promise<IngressData[]> {
    try {
      const response = await this.circuitBreaker.execute(async () => {
        return await this.retryHandler.execute(async () => {
          return await this.networkingV1Api.listNamespacedIngress({ namespace });
        });
      });
      const k8sIngresses = response.items;

      return transformIngresses(k8sIngresses);
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        console.error(
          `Circuit breaker is open - cannot fetch ingresses from namespace ${namespace}:`,
          error.message
        );
      } else {
        console.error(`Error fetching ingresses from namespace ${namespace}:`, error);
      }
      throw error;
    }
  }

  /**
   * Get specific ingress by name and namespace.
   * Uses circuit breaker and retry logic for resilience.
   *
   * @param name - The name of the ingress resource
   * @param namespace - The Kubernetes namespace containing the ingress
   * @returns Promise resolving to ingress data, or null if not found
   * @throws {CircuitBreakerOpenError} When circuit breaker is open due to repeated failures
   * @throws {Error} When Kubernetes API request fails after all retry attempts (except 404)
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * const ingress = await client.getIngress('my-app', 'production');
   * if (ingress) {
   *   console.log(`Ingress hosts: ${ingress.hosts.join(', ')}`);
   * } else {
   *   console.log('Ingress not found');
   * }
   * ```
   */
  async getIngress(name: string, namespace: string): Promise<IngressData | null> {
    try {
      const response = await this.circuitBreaker.execute(async () => {
        return await this.retryHandler.execute(async () => {
          return await this.networkingV1Api.readNamespacedIngress({ name, namespace });
        });
      });
      return transformIngress(response);
    } catch (error: unknown) {
      const err = error as { response?: { statusCode?: number } };
      // Check if it's a "not found" error
      if (err?.response?.statusCode === HTTP_STATUS.NOT_FOUND) {
        return null;
      }
      if (error instanceof CircuitBreakerOpenError) {
        console.error(
          `Circuit breaker is open - cannot fetch ingress ${name} in namespace ${namespace}:`,
          error
        );
      } else {
        console.error(`Error fetching ingress ${name} in namespace ${namespace}:`, error);
      }
      throw error;
    }
  }

  /**
   * Get all namespaces in the cluster.
   * Uses circuit breaker and retry logic for resilience.
   *
   * @returns Promise resolving to Kubernetes namespace list
   * @throws {CircuitBreakerOpenError} When circuit breaker is open due to repeated failures
   * @throws {Error} When Kubernetes API request fails after all retry attempts
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * const namespaces = await client.getNamespaces();
   * const namespaceNames = namespaces.items.map(ns => ns.metadata?.name);
   * console.log(`Available namespaces: ${namespaceNames.join(', ')}`);
   * ```
   */
  async getNamespaces(): Promise<V1NamespaceList> {
    try {
      const response = await this.circuitBreaker.execute(async () => {
        return await this.retryHandler.execute(async () => {
          return await this.coreV1Api.listNamespace();
        });
      });
      return response;
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        console.error('Circuit breaker is open - Kubernetes API is unavailable:', error.message);
      } else {
        console.error('Error fetching namespaces:', error);
      }
      throw error;
    }
  }

  /**
   * Get ingresses from multiple specific namespaces in parallel.
   * Failures in individual namespaces are logged but don't prevent other namespaces from being queried.
   *
   * @param namespaces - Array of namespace names to query
   * @returns Promise resolving to flattened array of ingress data from all specified namespaces
   * @throws {Error} When all namespace queries fail
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * const ingresses = await client.getIngressesByNamespaces(['production', 'staging', 'dev']);
   * console.log(`Found ${ingresses.length} ingresses across selected namespaces`);
   * ```
   */
  async getIngressesByNamespaces(namespaces: string[]): Promise<IngressData[]> {
    try {
      // Fetch ingresses from all specified namespaces in parallel for optimal performance
      // Each namespace query is independent and can run concurrently
      const namespacePromises = namespaces.map((ns) =>
        this.getIngressesByNamespace(ns).catch((err) => {
          // Graceful degradation: Log error but don't fail the entire operation
          // This ensures that if one namespace fails (e.g., due to RBAC), others still work
          console.error(`Error fetching ingresses from namespace ${ns}:`, err);
          return []; // Return empty array for failed namespaces so others can still work
        })
      );

      // Wait for all namespace queries to complete
      // Promise.all is safe here because we catch errors in the map above
      const namespaceResults = await Promise.all(namespacePromises);

      // Flatten the results from all namespaces into a single array
      // This provides a unified view of ingresses across multiple namespaces
      return namespaceResults.flat();
    } catch (error) {
      console.error('Error fetching ingresses from multiple namespaces:', error);
      throw error;
    }
  }

  /**
   * Check if the client has proper RBAC permissions to access Kubernetes resources.
   * Tests permissions by attempting to list namespaces.
   *
   * @returns Promise resolving to object containing permission status and error details
   * @returns {boolean} hasPermissions - True if client has necessary permissions
   * @returns {string} [error] - Error message if permissions check failed
   * @returns {boolean} [isRBACError] - True if error is specifically RBAC-related (403 Forbidden)
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * const { hasPermissions, error, isRBACError } = await client.checkPermissions();
   * if (!hasPermissions) {
   *   if (isRBACError) {
   *     console.error('RBAC permissions insufficient:', error);
   *   } else {
   *     console.error('Permission check failed:', error);
   *   }
   * }
   * ```
   */
  async checkPermissions(): Promise<{
    hasPermissions: boolean;
    error?: string;
    isRBACError?: boolean;
  }> {
    try {
      // Test by fetching a simple resource
      await this.getNamespaces();
      return { hasPermissions: true };
    } catch (error: unknown) {
      const err = error as {
        response?: { body?: { message?: string }; statusCode?: number };
        message?: string;
      };
      // Check if it's an RBAC-related error
      const isRBACError =
        err?.response?.body?.message?.includes('forbidden') ||
        err?.response?.body?.message?.includes('denied') ||
        err?.response?.statusCode === HTTP_STATUS.FORBIDDEN;

      return {
        hasPermissions: false,
        error: isRBACError
          ? 'Insufficient RBAC permissions'
          : err?.response?.body?.message || err.message,
        isRBACError,
      };
    }
  }

  /**
   * Get circuit breaker status for monitoring and observability.
   * Provides insights into the health of Kubernetes API connectivity.
   *
   * @returns Object containing circuit breaker metrics
   * @returns {CircuitState} state - Current circuit state (CLOSED, OPEN, or HALF_OPEN)
   * @returns {number} failureRate - Current failure rate (0-1)
   * @returns {number} requestCount - Number of requests in the sliding window
   * @returns {number} remainingTimeout - Milliseconds until circuit transitions to HALF_OPEN (0 if not OPEN)
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * const status = client.getCircuitBreakerStatus();
   * console.log(`Circuit state: ${status.state}, Failure rate: ${(status.failureRate * 100).toFixed(1)}%`);
   * ```
   */
  getCircuitBreakerStatus() {
    return {
      state: this.circuitBreaker.getState(),
      failureRate: this.circuitBreaker.getFailureRate(),
      requestCount: this.circuitBreaker.getRequestCount(),
      remainingTimeout: this.circuitBreaker.getRemainingTimeout(),
    };
  }

  /**
   * Watch ingress resources for changes across all namespaces.
   * Establishes a watch connection to receive real-time updates for ADDED, MODIFIED, and DELETED events.
   *
   * @param callback - Function called for each ingress event with event type and ingress data
   * @param done - Function called when watch connection closes normally
   * @param errorCb - Function called when an error occurs during watching
   * @returns Promise that resolves when watch is established
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * await client.watchIngresses(
   *   (type, ingress) => {
   *     console.log(`${type}: ${ingress.name} in ${ingress.namespace}`);
   *   },
   *   () => console.log('Watch connection closed'),
   *   (err) => console.error('Watch error:', err)
   * );
   * ```
   */
  async watchIngresses(
    callback: (type: string, ingress: IngressData) => void,
    done: () => void,
    errorCb: (err: Error) => void
  ): Promise<void> {
    const k8s = require('@kubernetes/client-node');
    const watch = new k8s.Watch(this.kubeConfig);

    try {
      await watch.watch(
        '/apis/networking.k8s.io/v1/ingresses',
        {},
        (type: string, k8sObject: V1Ingress) => {
          try {
            // Transform the Kubernetes object to our format
            const ingressData = transformIngress(k8sObject);
            callback(type, ingressData);
          } catch (error) {
            console.error('Error transforming ingress object:', error);
            errorCb(error as Error);
          }
        },
        (err: Error | null) => {
          if (err) {
            console.error('Error in ingress watch:', err);
            errorCb(err);
          } else {
            done();
          }
        }
      );
    } catch (error) {
      console.error('Failed to start ingress watch:', error);
      errorCb(error as Error);
    }
  }

  /**
   * Watch ingresses in a specific namespace for changes.
   * Establishes a watch connection to receive real-time updates for ADDED, MODIFIED, and DELETED events.
   *
   * @param namespace - The Kubernetes namespace to watch
   * @param callback - Function called for each ingress event with event type and ingress data
   * @param done - Function called when watch connection closes normally
   * @param errorCb - Function called when an error occurs during watching
   * @returns Promise that resolves when watch is established
   *
   * @example
   * ```typescript
   * const client = new KubernetesClient();
   * await client.watchIngressesByNamespace(
   *   'production',
   *   (type, ingress) => {
   *     console.log(`${type}: ${ingress.name}`);
   *   },
   *   () => console.log('Watch connection closed'),
   *   (err) => console.error('Watch error:', err)
   * );
   * ```
   */
  async watchIngressesByNamespace(
    namespace: string,
    callback: (type: string, ingress: IngressData) => void,
    done: () => void,
    errorCb: (err: Error) => void
  ): Promise<void> {
    const k8s = require('@kubernetes/client-node');
    const watch = new k8s.Watch(this.kubeConfig);

    try {
      await watch.watch(
        `/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`,
        {},
        (type: string, k8sObject: V1Ingress) => {
          try {
            // Transform the Kubernetes object to our format
            const ingressData = transformIngress(k8sObject);
            callback(type, ingressData);
          } catch (error) {
            console.error('Error transforming ingress object:', error);
            errorCb(error as Error);
          }
        },
        (err: Error | null) => {
          if (err) {
            console.error('Error in ingress watch:', err);
            errorCb(err);
          } else {
            done();
          }
        }
      );
    } catch (error) {
      console.error('Failed to start ingress watch:', error);
      errorCb(error as Error);
    }
  }
}

export default KubernetesClient;
