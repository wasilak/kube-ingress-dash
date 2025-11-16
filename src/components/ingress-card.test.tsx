import React from 'react';
import { render, screen } from '@testing-library/react';
import IngressCard from '@/components/ingress-card';
import { IngressData } from '@/types/ingress';

const mockIngress: IngressData = {
  id: 'test-id',
  name: 'test-ingress',
  namespace: 'test-namespace',
  hosts: ['example.com', 'api.example.com'],
  paths: ['/api', '/'],
  urls: ['https://example.com', 'https://api.example.com'],
  tls: true,
  status: 'ready',
  labels: { app: 'test-app', version: 'v1' },
  annotations: { 'kubernetes.io/ingress.class': 'nginx' },
  creationTimestamp: '2023-01-01T00:00:00.000Z',
};

describe('IngressCard', () => {
  it('renders ingress name and namespace', () => {
    render(<IngressCard ingress={mockIngress} />);

    expect(screen.getByText('test-ingress')).toBeInTheDocument();
    expect(screen.getByText('test-namespace')).toBeInTheDocument();
  });

  it('renders hosts as clickable buttons', () => {
    render(<IngressCard ingress={mockIngress} />);

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com')).toBeInTheDocument();
  });

  it('renders TLS icon when TLS is enabled', () => {
    render(<IngressCard ingress={mockIngress} />);

    // The lock icon is rendered as an SVG element with the class "lucide lucide-lock"
    const lockElement = document.querySelector('.lucide-lock');
    expect(lockElement).toBeInTheDocument();
  });

  it('renders paths information', () => {
    render(<IngressCard ingress={mockIngress} />);

    expect(screen.getByText('/api')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('renders ingress class annotation', () => {
    render(<IngressCard ingress={mockIngress} />);

    expect(screen.getByText('nginx')).toBeInTheDocument();
  });
});
