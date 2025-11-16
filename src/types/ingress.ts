export interface IngressData {
  id: string;
  name: string;
  namespace: string;
  hosts: string[];
  paths: string[];
  urls: string[];
  annotations: Record<string, string>;
  creationTimestamp: string;
  tls: boolean;
  status: 'ready' | 'pending' | 'error' | 'unknown';
  labels?: Record<string, string>;
}

export interface KubernetesIngress {
  apiVersion?: string;
  kind?: string;
  metadata: {
    name: string;
    namespace: string;
    uid: string;
    creationTimestamp: string;
    annotations?: Record<string, string>;
    labels?: Record<string, string>;
  };
  spec: {
    rules?: Array<{
      host?: string;
      http?: {
        paths: Array<{
          path: string;
          pathType: string;
          backend: {
            service: {
              name: string;
              port: {
                number: number;
              };
            };
          };
        }>;
      };
    }>;
    tls?: Array<{
      hosts?: string[];
      secretName?: string;
    }>;
  };
  status?: {
    loadBalancer?: {
      ingress?: Array<{
        ip?: string;
        hostname?: string;
      }>;
    };
  };
}

export interface IngressChangeEvent {
  type: 'ADDED' | 'MODIFIED' | 'DELETED';
  ingress: IngressData;
}
