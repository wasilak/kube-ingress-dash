import { KubeConfig, CoreV1Api, NetworkingV1Api, V1Ingress, V1NamespaceList } from '@kubernetes/client-node';
import { IngressData } from '@/types/ingress';
import { transformIngress, transformIngresses } from '@/lib/utils/ingress-transformer';
import { RetryHandler } from '@/lib/error-handler';

class KubernetesClient {
  public kubeConfig: KubeConfig;
  public networkingV1Api: NetworkingV1Api;
  public coreV1Api: CoreV1Api;
  private retryHandler: RetryHandler;

  constructor() {
    this.kubeConfig = new KubeConfig();
    
    // Load configuration based on environment (in-cluster vs out-of-cluster)
    if (process.env.NODE_ENV === 'production' || this.isInCluster()) {
      // In-cluster configuration
      this.kubeConfig.loadFromCluster();
    } else {
      // Out-of-cluster configuration
      this.kubeConfig.loadFromDefault();
    }

    // Initialize the Kubernetes API clients
    this.networkingV1Api = this.kubeConfig.makeApiClient(NetworkingV1Api);
    this.coreV1Api = this.kubeConfig.makeApiClient(CoreV1Api);
    
    // Initialize retry handler with exponential backoff
    this.retryHandler = new RetryHandler({
      maxAttempts: 3,
      initialDelayMs: 100,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
    });
  }

  /**
   * Check if the application is running inside a Kubernetes cluster
   */
  private isInCluster(): boolean {
    // Check for the presence of the service account token file
    try {
      // The service account token file path is typically mounted in-cluster
      // const tokenPath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
      return typeof process.env.KUBERNETES_SERVICE_HOST !== 'undefined';
    } catch (error) {
      return false;
    }
  }



  /**
   * Get all ingresses from all namespaces and transform them to IngressData format
   */
  async getIngresses(): Promise<IngressData[]> {
    try {
      const response = await this.retryHandler.execute(async () => {
        return await this.networkingV1Api.listIngressForAllNamespaces();
      });
      const k8sIngresses = response.items;
      
      // Transform Kubernetes ingress objects to our format
      return transformIngresses(k8sIngresses);
    } catch (error) {
      console.error('Error fetching ingresses:', error);
      throw error;
    }
  }

  /**
   * Get ingresses from a specific namespace
   */
  async getIngressesByNamespace(namespace: string): Promise<IngressData[]> {
    try {
      const response = await this.retryHandler.execute(async () => {
        return await this.networkingV1Api.listNamespacedIngress({namespace});
      });
      const k8sIngresses = response.items;
      
      return transformIngresses(k8sIngresses);
    } catch (error) {
      console.error(`Error fetching ingresses from namespace ${namespace}:`, error);
      throw error;
    }
  }

  /**
   * Get specific ingress by name and namespace
   */
  async getIngress(name: string, namespace: string): Promise<IngressData | null> {
    try {
      const response = await this.retryHandler.execute(async () => {
        return await this.networkingV1Api.readNamespacedIngress({name, namespace});
      });
      return transformIngress(response);
    } catch (error: unknown) {
      const err = error as { response?: { statusCode?: number } };
      // Check if it's a "not found" error
      if (err?.response?.statusCode === 404) {
        return null;
      }
      console.error(`Error fetching ingress ${name} in namespace ${namespace}:`, error);
      throw error;
    }
  }

  /**
   * Get all namespaces in the cluster
   */
  async getNamespaces(): Promise<V1NamespaceList> {
    try {
      const response = await this.retryHandler.execute(async () => {
        return await this.coreV1Api.listNamespace();
      });
      return response;
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      throw error;
    }
  }

  /**
   * Get ingresses from multiple specific namespaces
   */
  async getIngressesByNamespaces(namespaces: string[]): Promise<IngressData[]> {
    try {
      // Fetch ingresses from all specified namespaces in parallel
      const namespacePromises = namespaces.map(ns =>
        this.getIngressesByNamespace(ns).catch(err => {
          console.error(`Error fetching ingresses from namespace ${ns}:`, err);
          return []; // Return empty array for failed namespaces so others can still work
        })
      );

      const namespaceResults = await Promise.all(namespacePromises);

      // Flatten the results from all namespaces into a single array
      return namespaceResults.flat();
    } catch (error) {
      console.error('Error fetching ingresses from multiple namespaces:', error);
      throw error;
    }
  }

  /**
   * Check if the client has proper RBAC permissions
   */
  async checkPermissions(): Promise<{ hasPermissions: boolean; error?: string; isRBACError?: boolean }> {
    try {
      // Test by fetching a simple resource
      await this.getNamespaces();
      return { hasPermissions: true };
    } catch (error: unknown) {
      const err = error as { response?: { body?: { message?: string }; statusCode?: number }; message?: string };
      // Check if it's an RBAC-related error
      const isRBACError = err?.response?.body?.message?.includes('forbidden') ||
                         err?.response?.body?.message?.includes('denied') ||
                         err?.response?.statusCode === 403;

      return {
        hasPermissions: false,
        error: isRBACError ? 'Insufficient RBAC permissions' : err?.response?.body?.message || err.message,
        isRBACError
      };
    }
  }

  /**
   * Watch ingress resources for changes
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
   * Watch ingresses in a specific namespace for changes
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