export type GroupingMode = 'none' | 'namespace' | 'tls';

export interface IngressGroup {
  key: string;
  label: string;
  count: number;
  ingresses: import('./ingress').IngressData[];
}
