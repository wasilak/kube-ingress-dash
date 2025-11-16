import { KubeConfig, V1Ingress } from '@kubernetes/client-node';
import { IngressData } from '@/types/ingress';
import KubernetesClient from './client';
import { transformIngress } from '@/lib/utils/ingress-transformer';

export interface IngressEvent {
  type: 'ADDED' | 'MODIFIED' | 'DELETED';
  ingress: IngressData;
}

interface WatchInstance {
  abort: () => void;
}

export class IngressStream {
  private kubeClient: KubernetesClient;
  private watch: {
    new (config: KubeConfig): {
      watch: (
        path: string,
        params: Record<string, unknown>,
        callback: (type: string, obj: V1Ingress) => void,
        errorCallback: (err: Error) => void
      ) => Promise<WatchInstance>;
    };
  };
  private eventHandlers: ((event: IngressEvent) => void)[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];
  private activeWatch: WatchInstance | null = null;
  private watchStopper: (() => void) | null = null;
  private currentNamespace?: string;
  private autoReconnect: boolean = true;

  constructor(options?: { autoReconnect?: boolean }) {
    this.kubeClient = new KubernetesClient();
    this.autoReconnect = options?.autoReconnect ?? true;

    // Dynamically import the Watch class since it's not in the types
    this.watch = require('@kubernetes/client-node').Watch;
  }

  /**
   * Add an event handler for ingress events
   */
  addEventHandler(handler: (event: IngressEvent) => void): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove an event handler
   */
  removeEventHandler(handler: (event: IngressEvent) => void): void {
    this.eventHandlers = this.eventHandlers.filter((h) => h !== handler);
  }

  /**
   * Add an error handler for stream errors
   */
  addErrorHandler(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Remove an error handler
   */
  removeErrorHandler(handler: (error: Error) => void): void {
    this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
  }

  /**
   * Emit an ingress event to all registered handlers
   *
   * Optimized for minimal latency - handlers are called synchronously
   * to ensure events are delivered as quickly as possible.
   */
  private emitEvent(event: IngressEvent): void {
    // Call handlers synchronously for minimal latency
    // Error handling ensures one failing handler doesn't affect others
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in ingress event handler:', error);
        this.emitError(error as Error);
      }
    }
  }

  /**
   * Emit an error to all registered error handlers
   */
  private emitError(error: Error): void {
    for (const handler of this.errorHandlers) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }
  }

  /**
   * Start watching ingress resources
   */
  async startWatching(namespace?: string): Promise<void> {
    if (this.watchStopper) {
      this.stopWatching();
    }

    // Store the namespace for potential reconnection
    this.currentNamespace = namespace;

    try {
      // Create a new watch instance
      const watchInstance = new this.watch(this.kubeClient.kubeConfig);

      const queryParams: Record<string, unknown> = {};
      if (namespace) {
        // Watch in a specific namespace
        this.activeWatch = await watchInstance.watch(
          `/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`,
          queryParams,
          (type: string, obj: V1Ingress) => {
            this.handleWatchEvent(type, obj);
          },
          (err: Error) => {
            this.handleWatchError(err);
          }
        );
      } else {
        // Watch across all namespaces
        this.activeWatch = await watchInstance.watch(
          `/apis/networking.k8s.io/v1/ingresses`,
          queryParams,
          (type: string, obj: V1Ingress) => {
            this.handleWatchEvent(type, obj);
          },
          (err: Error) => {
            this.handleWatchError(err);
          }
        );
      }

      // Store the function to stop the watch
      this.watchStopper = () => {
        if (this.activeWatch) {
          this.activeWatch.abort();
          this.activeWatch = null;
        }
      };
    } catch (error) {
      this.emitError(error as Error);
      throw error;
    }
  }

  /**
   * Handle events from the Kubernetes watch
   *
   * Optimized for minimal latency - processes events immediately
   * and uses efficient type mapping.
   */
  private handleWatchEvent(type: string, obj: V1Ingress): void {
    try {
      // Transform ingress data efficiently
      const ingressData = transformIngress(obj);

      // Use type mapping for optimal performance
      const eventTypeMap: Record<string, 'ADDED' | 'MODIFIED' | 'DELETED'> = {
        ADDED: 'ADDED',
        MODIFIED: 'MODIFIED',
        DELETED: 'DELETED',
      };

      const eventType = eventTypeMap[type];

      if (!eventType) {
        console.warn(`Unknown event type: ${type}`);
        return;
      }

      // Emit event immediately for minimal latency
      this.emitEvent({
        type: eventType,
        ingress: ingressData,
      });
    } catch (error) {
      console.error('Error processing watch event:', error);
      this.emitError(error as Error);
    }
  }

  /**
   * Handle errors from the Kubernetes watch
   */
  private handleWatchError(error: Error): void {
    console.error('Watch error:', error);
    this.emitError(error);

    // Only auto-reconnect if enabled (disabled when used in multi-namespace manager)
    if (this.autoReconnect) {
      // Implement reconnection logic with exponential backoff
      setTimeout(() => {
        console.log('Attempting to restart watch after error...');
        this.startWatching(this.currentNamespace).catch((err) => {
          console.error('Failed to restart watch:', err);
          this.emitError(err);
        });
      }, 5000); // Retry after 5 seconds
    }
  }

  /**
   * Stop watching ingress resources
   */
  stopWatching(): void {
    if (this.watchStopper) {
      this.watchStopper();
      this.watchStopper = null;
      this.activeWatch = null;
    }
  }

  /**
   * Check if the stream is currently active
   */
  isActive(): boolean {
    return this.watchStopper !== null && this.activeWatch !== null;
  }
}
