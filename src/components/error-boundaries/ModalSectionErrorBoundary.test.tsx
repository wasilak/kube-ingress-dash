import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModalSectionErrorBoundary from './ModalSectionErrorBoundary';
import { MantineProvider } from '@mantine/core';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Component that renders successfully
const SuccessComponent = () => <div>Success content</div>;

const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('ModalSectionErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    renderWithMantine(
      <ModalSectionErrorBoundary sectionName="Test Section">
        <SuccessComponent />
      </ModalSectionErrorBoundary>
    );

    expect(screen.getByText('Success content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    renderWithMantine(
      <ModalSectionErrorBoundary sectionName="Test Section">
        <ThrowError />
      </ModalSectionErrorBoundary>
    );

    expect(screen.getByText(/Error loading Test Section/i)).toBeInTheDocument();
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it('displays retry button when error occurs', () => {
    renderWithMantine(
      <ModalSectionErrorBoundary sectionName="Test Section">
        <ThrowError />
      </ModalSectionErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('includes section name in error message', () => {
    renderWithMantine(
      <ModalSectionErrorBoundary sectionName="YAML Manifest">
        <ThrowError />
      </ModalSectionErrorBoundary>
    );

    expect(screen.getByText(/Error loading YAML Manifest/i)).toBeInTheDocument();
  });
});
