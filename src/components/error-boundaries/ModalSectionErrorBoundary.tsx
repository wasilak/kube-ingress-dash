'use client';

import React from 'react';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface ModalSectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionName: string;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ModalSectionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary for individual modal sections.
 * Catches errors in modal section rendering and displays a user-friendly error message.
 */
class ModalSectionErrorBoundary extends React.Component<
  ModalSectionErrorBoundaryProps,
  ModalSectionErrorBoundaryState
> {
  constructor(props: ModalSectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ModalSectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Modal section error caught (${this.props.sectionName}):`, {
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
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={`Error loading ${this.props.sectionName}`}
          color="red"
          variant="light"
        >
          <Stack gap="sm">
            <Text size="sm">
              {this.state.error?.message || `Unable to display ${this.props.sectionName} section`}
            </Text>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              onClick={this.reset}
            >
              Retry
            </Button>
          </Stack>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ModalSectionErrorBoundary;
