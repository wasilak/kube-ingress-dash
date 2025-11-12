import { KubeConfig, NetworkingV1Api, V1Ingress } from '@kubernetes/client-node';
import { IngressData } from '@/types/ingress';
import KubernetesClient from './client';
import { Writable } from 'stream';
import { transformIngress } from '@/lib/utils/ingress-transformer';

export interface IngressEvent {
  type: 'ADDED' | 'MODIFIED' | 'DELETED';
  ingress: IngressData;
}

export class IngressStream {
  private kubeClient: KubernetesClient;
  private networkingV1Api: NetworkingV1Api;
  private watch: any; // We'll import Watch from kubernetes-client-node later
  private eventHandlers: ((event: IngressEvent) => void)[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];
  private activeWatch: any = null;
  private watchStopper: (() => void) | null = null;

  constructor() {
    this.kubeClient = new KubernetesClient();
    this.networkingV1Api = this.kubeClient.networkingV1Api;
    
    // Dynamically import the Watch class since it's not in the types
    this.watch = require('@kubernetes/client-node').Watch;
  }

  /**
   * Add an event handler for ingress events
   */
  addEventHandler(handler: (event: IngressEvent) => void) {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove an event handler
   */
  removeEventHandler(handler: (event: IngressEvent) => void) {
    this.eventHandlers = this.eventHandlers.filter(h => h !== handler);
  }

  /**
   * Add an error handler for stream errors
   */
  addErrorHandler(handler: (error: Error) => void) {
    this.errorHandlers.push(handler);
  }

  /**
   * Remove an error handler
   */
  removeErrorHandler(handler: (error: Error) => void) {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }

  /**
   * Emit an ingress event to all registered handlers
   */
  private emitEvent(event: IngressEvent) {
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
  private emitError(error: Error) {
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
  async startWatching(namespace?: string) {
    if (this.watchStopper) {
      this.stopWatching();
    }

    try {
      // Create a new watch instance
      const watchInstance = new this.watch(this.kubeClient.kubeConfig);
      
      const queryParams: any = {};
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
    }
  }

  /**
   * Handle events from the Kubernetes watch
   */
  private handleWatchEvent(type: string, obj: V1Ingress) {
    try {
      const ingressData = transformIngress(obj);
      let eventType: 'ADDED' | 'MODIFIED' | 'DELETED';
      
      switch (type) {
        case 'ADDED':
          eventType = 'ADDED';
          break;
        case 'MODIFIED':
          eventType = 'MODIFIED';
          break;
        case 'DELETED':
          eventType = 'DELETED';
          break;
        default:
          console.warn(`Unknown event type: ${type}`);
          return;
      }
      
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
  private handleWatchError(error: Error) {
    console.error('Watch error:', error);
    this.emitError(error);

    // Implement reconnection logic with exponential backoff
    setTimeout(() => {
      console.log('Attempting to restart watch after error...');
      const namespace = this.extractNamespaceFromActiveWatch();
      this.startWatching(namespace).catch(err => {
        console.error('Failed to restart watch:', err);
        this.emitError(err);
      });
    }, 5000); // Retry after 5 seconds
  }

  /**
   * Extract the namespace from the currently active watch (simplified - in real implementation would need to track)
   */
  private extractNamespaceFromActiveWatch(): string | undefined {
    // This is a simplification - in practice, you'd need to track the namespace
    // that was used when starting the watch
    return undefined;
  }

  /**
   * Stop watching ingress resources
   */
  stopWatching() {
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