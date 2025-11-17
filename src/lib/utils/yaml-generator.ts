import yaml from 'js-yaml';
import type { V1Ingress } from '@kubernetes/client-node';

/**
 * Generates a Kubernetes YAML manifest from an Ingress resource
 * @param k8sIngress - The Kubernetes Ingress object
 * @returns YAML string representation of the ingress
 */
export function generateIngressYAML(k8sIngress: V1Ingress): string {
  try {
    // Create a clean Kubernetes manifest structure
    const manifest = {
      apiVersion: k8sIngress.apiVersion || 'networking.k8s.io/v1',
      kind: k8sIngress.kind || 'Ingress',
      metadata: {
        name: k8sIngress.metadata?.name,
        namespace: k8sIngress.metadata?.namespace,
        ...(k8sIngress.metadata?.labels && { labels: k8sIngress.metadata.labels }),
        ...(k8sIngress.metadata?.annotations && { annotations: k8sIngress.metadata.annotations }),
        ...(k8sIngress.metadata?.creationTimestamp && {
          creationTimestamp: k8sIngress.metadata.creationTimestamp,
        }),
        ...(k8sIngress.metadata?.uid && { uid: k8sIngress.metadata.uid }),
        ...(k8sIngress.metadata?.resourceVersion && {
          resourceVersion: k8sIngress.metadata.resourceVersion,
        }),
      },
      spec: k8sIngress.spec,
      ...(k8sIngress.status && { status: k8sIngress.status }),
    };

    // Convert to YAML with proper formatting
    return yaml.dump(manifest, {
      indent: 2,
      lineWidth: -1, // No line wrapping
      noRefs: true, // Don't use YAML references
      sortKeys: false, // Maintain key order
    });
  } catch (error) {
    console.error('Failed to generate YAML manifest:', error);
    throw new Error('Failed to generate YAML manifest');
  }
}
