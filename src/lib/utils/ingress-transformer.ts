import { V1Ingress } from '@kubernetes/client-node';
import { IngressData } from '@/types/ingress';

/**
 * Transform a raw Kubernetes Ingress object to our UI-friendly IngressData format
 */
export function transformIngress(k8sIngress: V1Ingress): IngressData {
  const metadata = k8sIngress.metadata || { name: 'unknown', namespace: 'default' };
  
  const hosts: string[] = [];
  const paths: string[] = [];
  const urls: string[] = [];
  
  // Extract hosts and paths from ingress rules
  if (k8sIngress.spec?.rules) {
    for (const rule of k8sIngress.spec.rules) {
      if (rule.host) {
        hosts.push(rule.host);
      }
      
      if (rule.http?.paths) {
        for (const path of rule.http.paths) {
          paths.push(path.path || '/');
          
          // Build URLs for the ingress
          if (rule.host) {
            const protocol = k8sIngress.spec?.tls ? 'https' : 'http';
            const pathValue = path.path || '/';
            urls.push(`${protocol}://${rule.host}${pathValue}`);
          }
        }
      }
    }
  }
  
  // Check for TLS configuration
  const hasTLS = !!(k8sIngress.spec?.tls && k8sIngress.spec.tls.length > 0);
  
  // Extract TLS hosts if available
  if (k8sIngress.spec?.tls) {
    for (const tls of k8sIngress.spec.tls) {
      if (tls.hosts) {
        for (const host of tls.hosts) {
          if (!hosts.includes(host)) {
            hosts.push(host);
          }
        }
      }
    }
  }
  
  return {
    id: metadata.uid || `${metadata.namespace}-${metadata.name}`,
    name: metadata.name || 'unknown',
    namespace: metadata.namespace || 'default',
    hosts,
    paths,
    urls,
    annotations: metadata.annotations || {},
    creationTimestamp: metadata.creationTimestamp?.toISOString() || new Date().toISOString(),
    tls: hasTLS,
    status: 'unknown', // This would be populated based on actual status in a real implementation
    labels: metadata.labels || {},
  };
}

/**
 * Transform multiple Kubernetes Ingress objects to IngressData format
 */
export function transformIngresses(k8sIngresses: V1Ingress[]): IngressData[] {
  return k8sIngresses.map(ingress => transformIngress(ingress));
}

/**
 * Filter ingresses based on a search term
 */
export function filterIngresses(ingresses: IngressData[], searchTerm: string): IngressData[] {
  if (!searchTerm) {
    return ingresses;
  }
  
  const term = searchTerm.toLowerCase();
  
  return ingresses.filter(ingress => {
    return (
      ingress.name.toLowerCase().includes(term) ||
      ingress.namespace.toLowerCase().includes(term) ||
      ingress.hosts.some(host => host.toLowerCase().includes(term)) ||
      ingress.urls.some(url => url.toLowerCase().includes(term)) ||
      ingress.paths.some(path => path.toLowerCase().includes(term)) ||
      Object.entries(ingress.annotations).some(([key, value]) => 
        key.toLowerCase().includes(term) || value.toLowerCase().includes(term)
      )
    );
  });
}

/**
 * Extract specific information from ingress annotations
 */
export function getIngressAnnotation(ingress: IngressData, annotationKey: string): string | undefined {
  return ingress.annotations[annotationKey];
}

/**
 * Get the display name for an ingress (using name or first host as fallback)
 */
export function getIngressDisplayName(ingress: IngressData): string {
  if (ingress.name && ingress.name !== 'unknown') {
    return ingress.name;
  }
  return ingress.hosts[0] || ingress.urls[0] || 'Unnamed Ingress';
}