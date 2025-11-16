'use client';

import React from 'react';
import ErrorScreen from '@/components/error-screen';

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for the main dashboard section.
 * Catches errors in the dashboard and displays a user-friendly error screen.
 */
class DashboardErrorBoundary extends React.Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  constructor(props: DashboardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard error caught:', {
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
        <ErrorScreen
          title="Dashboard Error"
          message={this.state.error?.message || 'An error occurred in the dashboard'}
          error={this.state.error}
          onRetry={this.reset}
          errorType="generic"
        />
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
