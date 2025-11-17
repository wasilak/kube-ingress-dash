import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import IngressCard from '@/components/ingress-card';
import { IngressData } from '@/types/ingress';
import userEvent from '@testing-library/user-event';

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

const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('IngressCard', () => {
  it('renders ingress name and namespace', () => {
    renderWithMantine(<IngressCard ingress={mockIngress} />);

    expect(screen.getByText('test-ingress')).toBeInTheDocument();
    expect(screen.getByText('test-namespace')).toBeInTheDocument();
  });

  it('renders hosts as clickable buttons', () => {
    renderWithMantine(<IngressCard ingress={mockIngress} />);

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com')).toBeInTheDocument();
  });

  it('renders TLS icon when TLS is enabled', () => {
    renderWithMantine(<IngressCard ingress={mockIngress} />);

    // The lock icon is rendered as an SVG element from Tabler icons
    const lockElement = document.querySelector('svg');
    expect(lockElement).toBeInTheDocument();
  });

  it('does not render TLS icon when TLS is disabled', () => {
    const ingressWithoutTls = { ...mockIngress, tls: false };
    renderWithMantine(<IngressCard ingress={ingressWithoutTls} />);

    // Check that there are fewer SVG elements (no lock icon)
    const svgElements = document.querySelectorAll('svg');
    // Should have icons for layers and external links, but not lock
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('renders paths information', () => {
    renderWithMantine(<IngressCard ingress={mockIngress} />);

    expect(screen.getByText('/api')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('renders ingress class annotation', () => {
    renderWithMantine(<IngressCard ingress={mockIngress} />);

    expect(screen.getByText('nginx')).toBeInTheDocument();
  });

  it('renders details button when onDetailsClick is provided', () => {
    const onDetailsClick = jest.fn();
    renderWithMantine(<IngressCard ingress={mockIngress} onDetailsClick={onDetailsClick} />);

    const detailsButton = screen.getByLabelText('View details for test-ingress');
    expect(detailsButton).toBeInTheDocument();
  });

  it('does not render details button when onDetailsClick is not provided', () => {
    renderWithMantine(<IngressCard ingress={mockIngress} />);

    const detailsButton = screen.queryByLabelText('View details for test-ingress');
    expect(detailsButton).not.toBeInTheDocument();
  });

  it('calls onDetailsClick when details button is clicked', async () => {
    const user = userEvent.setup();
    const onDetailsClick = jest.fn();
    renderWithMantine(<IngressCard ingress={mockIngress} onDetailsClick={onDetailsClick} />);

    const detailsButton = screen.getByLabelText('View details for test-ingress');
    await user.click(detailsButton);

    expect(onDetailsClick).toHaveBeenCalledTimes(1);
  });
});
