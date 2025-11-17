export interface CertificateDetails {
  expirationDate: string; // ISO 8601 format
  daysUntilExpiration: number;
  issuer: string;
  subject: string;
  validDomains: string[];
  status: 'valid' | 'expiring' | 'expired';
  secretName: string;
}

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
  certificate?: CertificateDetails;
  yamlManifest?: string;
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
    ingressClassName?: string;
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

export interface IngressDetailResponse {
  ingress: IngressData;
  certificate?: CertificateDetails;
  yamlManifest: string;
}

export interface CertificateResponse {
  certificate: CertificateDetails;
  error?: string;
}
