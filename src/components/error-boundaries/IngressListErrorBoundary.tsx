'use client';

import React from 'react';
import ErrorScreen from '@/components/error-screen';

interface IngressListErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface IngressListErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for the ingress list section.
 * Catches errors in the ingress list rendering and displays a user-friendly error screen.
 */
class IngressListErrorBoundary extends React.Component<
  IngressListErrorBoundaryProps,
  IngressListErrorBoundaryState
> {
  constructor(props: IngressListErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): IngressListErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Ingress list error caught:', {
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
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <ErrorScreen
            title="Ingress List Error"
            message={this.state.error?.message || 'Unable to display ingress list'}
            error={this.state.error}
            onRetry={this.reset}
            errorType="generic"
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default IngressListErrorBoundary;
