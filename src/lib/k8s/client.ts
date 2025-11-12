import { KubeConfig, CoreV1Api, NetworkingV1Api, V1Ingress, V1NamespaceList } from '@kubernetes/client-node';
import { IngressData, KubernetesIngress } from '@/types/ingress';
import { transformIngress, transformIngresses } from '@/lib/utils/ingress-transformer';

class KubernetesClient {
  public kubeConfig: KubeConfig;
  public networkingV1Api: NetworkingV1Api;
  public coreV1Api: CoreV1Api;

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
  }

  /**
   * Check if the application is running inside a Kubernetes cluster
   */
  private isInCluster(): boolean {
    // Check for the presence of the service account token file
    try {
      // The service account token file path is typically mounted in-cluster
      const tokenPath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
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
      const response = await this.networkingV1Api.listIngressForAllNamespaces();
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
      const response = await this.networkingV1Api.listNamespacedIngress({namespace});
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
      const response = await this.networkingV1Api.readNamespacedIngress({name, namespace});
      return transformIngress(response);
    } catch (error: any) {
      // Check if it's a "not found" error
      if (error?.response?.statusCode === 404) {
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
      const response = await this.coreV1Api.listNamespace();
      return response;
    } catch (error) {
      console.error('Error fetching namespaces:', error);
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
    } catch (error: any) {
      // Check if it's an RBAC-related error
      const isRBACError = error?.response?.body?.message?.includes('forbidden') ||
                         error?.response?.body?.message?.includes('denied') ||
                         error?.response?.statusCode === 403;
      
      return {
        hasPermissions: false,
        error: isRBACError ? 'Insufficient RBAC permissions' : error?.response?.body?.message || error.message,
        isRBACError
      };
    }
  }
}

export default KubernetesClient;