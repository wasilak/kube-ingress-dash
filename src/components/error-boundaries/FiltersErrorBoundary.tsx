'use client';

import React from 'react';
import { Alert, Group, Text, Button } from '@mantine/core';

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
        <Alert color="red" variant="light">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text size="sm" fw={500}>
                Filter Error
              </Text>
              <Text size="xs" c="dimmed">
                {this.state.error?.message || 'Unable to load filters'}
              </Text>
            </div>
            <Button size="xs" variant="subtle" onClick={this.reset}>
              Retry
            </Button>
          </Group>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default FiltersErrorBoundary;
