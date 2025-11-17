import { generateIngressYAML } from './yaml-generator';
import type { V1Ingress } from '@kubernetes/client-node';

describe('generateIngressYAML', () => {
  it('should generate valid YAML from an Ingress object', () => {
    const mockIngress: V1Ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: 'test-ingress',
        namespace: 'default',
        labels: {
          app: 'test',
        },
        annotations: {
          'nginx.ingress.kubernetes.io/rewrite-target': '/',
        },
      },
      spec: {
        rules: [
          {
            host: 'test.example.com',
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: 'test-service',
                      port: {
                        number: 80,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const yaml = generateIngressYAML(mockIngress);

    expect(yaml).toBeDefined();
    expect(yaml).toContain('apiVersion: networking.k8s.io/v1');
    expect(yaml).toContain('kind: Ingress');
    expect(yaml).toContain('name: test-ingress');
    expect(yaml).toContain('namespace: default');
    expect(yaml).toContain('test.example.com');
  });

  it('should handle ingress with TLS configuration', () => {
    const mockIngress: V1Ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: 'tls-ingress',
        namespace: 'default',
      },
      spec: {
        tls: [
          {
            hosts: ['secure.example.com'],
            secretName: 'tls-secret',
          },
        ],
        rules: [
          {
            host: 'secure.example.com',
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: 'secure-service',
                      port: {
                        number: 443,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const yaml = generateIngressYAML(mockIngress);

    expect(yaml).toContain('tls:');
    expect(yaml).toContain('secure.example.com');
    expect(yaml).toContain('secretName: tls-secret');
  });
});
