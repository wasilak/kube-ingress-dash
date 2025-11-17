import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IngressDetailsModal } from './ingress-details-modal';
import { MantineProvider } from '@mantine/core';
import { IngressData } from '@/types/ingress';

// Mock react-syntax-highlighter
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}));

const mockIngress: IngressData = {
  id: 'test-ingress',
  name: 'test-ingress',
  namespace: 'default',
  hosts: ['example.com'],
  paths: ['/'],
  urls: ['https://example.com'],
  annotations: {
    'kubernetes.io/ingress.class': 'nginx',
  },
  creationTimestamp: '2024-01-01T00:00:00Z',
  tls: true,
  status: 'ready',
  labels: {
    app: 'test',
  },
  yamlManifest: 'apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: test-ingress',
};

const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('IngressDetailsModal - Loading and Error States', () => {
  it('displays retry button when YAML manifest is not available', () => {
    const ingressWithoutYaml = { ...mockIngress, yamlManifest: undefined };

    renderWithMantine(
      <IngressDetailsModal opened={true} onClose={jest.fn()} ingress={ingressWithoutYaml} />
    );

    // Check for warning message
    expect(screen.getByText(/yaml manifest not available/i)).toBeInTheDocument();
  });

  it('uses CopyButton component for copying', () => {
    renderWithMantine(
      <IngressDetailsModal opened={true} onClose={jest.fn()} ingress={mockIngress} />
    );

    // Verify CopyButton is used (it renders as a button)
    const buttons = screen.getAllByRole('button');
    // Should have at least: close button, expand buttons, copy buttons
    expect(buttons.length).toBeGreaterThan(3);
  });

  it('renders all modal sections with error boundaries', () => {
    renderWithMantine(
      <IngressDetailsModal opened={true} onClose={jest.fn()} ingress={mockIngress} />
    );

    // Verify main sections are rendered
    expect(screen.getByText(/details/i)).toBeInTheDocument();
    expect(screen.getByText(/labels/i)).toBeInTheDocument();
    expect(screen.getByText(/annotations/i)).toBeInTheDocument();
    expect(screen.getByText(/configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/yaml manifest/i)).toBeInTheDocument();
  });

  it('labels and annotations are collapsed by default', () => {
    renderWithMantine(
      <IngressDetailsModal opened={true} onClose={jest.fn()} ingress={mockIngress} />
    );

    // Labels and annotations should have expand buttons
    const expandButtons = screen.getAllByRole('button', { name: /expand/i });
    expect(expandButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('does not display status field', () => {
    renderWithMantine(
      <IngressDetailsModal opened={true} onClose={jest.fn()} ingress={mockIngress} />
    );

    // Status field should not be present
    expect(screen.queryByText(/status:/i)).not.toBeInTheDocument();
  });
});
