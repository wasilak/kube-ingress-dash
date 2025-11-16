'use client';

import React from 'react';

interface FiltersErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface FiltersErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for the filters section.
 * Catches errors in the filter components and displays a minimal fallback.
 */
class FiltersErrorBoundary extends React.Component<
  FiltersErrorBoundaryProps,
  FiltersErrorBoundaryState
> {
  constructor(props: FiltersErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FiltersErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Filters error caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} reset={this.reset} />;
      }

      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-destructive">Filter Error</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {this.state.error?.message || 'Unable to load filters'}
              </p>
            </div>
            <button onClick={this.reset} className="text-xs text-primary hover:underline">
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FiltersErrorBoundary;
