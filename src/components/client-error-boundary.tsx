'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, Card, Title, Container, Center, Group, Text, ThemeIcon } from '@mantine/core';

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
        <Container py="xl">
          <Card style={{ maxWidth: 768, margin: '0 auto' }} padding="lg" radius="md" withBorder>
            <Card.Section p="xl" ta="center">
              <Center mb="md">
                <ThemeIcon size={48} radius="xl" color="red" variant="light">
                  <AlertCircle size={24} />
                </ThemeIcon>
              </Center>
              <Title order={3}>Something went wrong</Title>
            </Card.Section>
            <Card.Section p="xl" pt={0} ta="center">
              <Text c="dimmed" mb="md">
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
              <Group justify="center" gap="sm" wrap="wrap">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
                <Button variant="filled" onClick={() => this.setState({ hasError: false })}>
                  Try Again
                </Button>
              </Group>
            </Card.Section>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ClientErrorBoundary;
