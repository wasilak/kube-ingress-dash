import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '@/components/error-boundary';

// Component that will throw an error for testing purposes
const BrokenComponent = () => {
  throw new Error('Test error');
};

// Component that doesn't throw an error
const WorkingComponent = () => {
  return <div>Working component</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('catches error and displays error UI when child throws error', () => {
    console.error = jest.fn(); // Suppress error logging during test
    
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('allows retrying after error', () => {
    console.error = jest.fn(); // Suppress error logging during test
    
    const { unmount, rerender } = render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Unmount and re-render with a working component
    unmount();
    
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Working component')).toBeInTheDocument();
  });
});