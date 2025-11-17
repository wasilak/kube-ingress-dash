'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, Card, Title } from '@mantine/core';

interface ClientErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ClientErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ClientErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ClientErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Client error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto py-8">
          <Card className="max-w-2xl mx-auto" padding="lg" radius="md" withBorder>
            <Card.Section className="text-center p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <Title order={3} className="text-xl">
                Something went wrong
              </Title>
            </Card.Section>
            <Card.Section className="text-center p-6 pt-0">
              <p className="text-muted-foreground mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
                <Button variant="filled" onClick={() => this.setState({ hasError: false })}>
                  Try Again
                </Button>
              </div>
            </Card.Section>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ClientErrorBoundary;
