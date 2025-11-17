'use client';

import React from 'react';
import { Center, Stack, Title, Text, Button } from '@mantine/core';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: ({ error }: { error: Error }) => React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error! });
      }
      return (
        <Center style={{ minHeight: '60vh' }} p="md">
          <Stack gap="md" align="center" ta="center">
            <Title order={2} c="red">
              Something went wrong
            </Title>
            <Text c="dimmed">{this.state.error?.message || 'An unexpected error occurred'}</Text>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </Stack>
        </Center>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
