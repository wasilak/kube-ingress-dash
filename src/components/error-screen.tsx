'use client';

import React from 'react';
import {
  Button,
  Card,
  Text,
  Title,
  Select,
  useMantineColorScheme,
  Container,
  Group,
  Center,
} from '@mantine/core';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ErrorClassifier } from '@/lib/error-handler/classifier';
import { ErrorClassification } from '@/types/errors';

interface ErrorScreenProps {
  title?: string;
  message: string;
  errorType?: 'permission' | 'api' | 'generic';
  documentationLink?: string;
  documentationText?: string;
  onRetry?: () => void;
  error?: unknown;
  classification?: ErrorClassification;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Access Error',
  message,
  errorType = 'generic',
  documentationLink,
  documentationText,
  onRetry,
  error,
  classification,
}) => {
  // Classify the error if provided
  const errorClassification = classification || (error ? ErrorClassifier.classify(error) : null);

  // Get smart defaults from classification
  const smartDocLink = errorClassification
    ? ErrorClassifier.getDocumentationLink(errorClassification)
    : documentationLink ||
      'https://wasilak.github.io/kube-ingress-dash/docs/architecture/rbac-setup';

  const smartDocText = errorClassification
    ? ErrorClassifier.getDocumentationText(errorClassification)
    : documentationText || 'RBAC Setup Documentation';

  const smartMessage = errorClassification
    ? ErrorClassifier.getUserMessage(errorClassification)
    : message;

  // Determine the icon and color scheme based on error type or classification
  const getErrorConfig = () => {
    // Use classification if available
    if (errorClassification) {
      switch (errorClassification.category) {
        case 'authentication':
          return {
            title: title || 'Authentication Error',
            description: 'Authentication is required to access this resource',
            borderColor: 'var(--mantine-color-red-6)',
            textColor: 'red',
          };
        case 'authorization':
          return {
            title: title || 'Permission Error',
            description: "You don't have sufficient permissions to access Kubernetes resources",
            borderColor: 'var(--mantine-color-orange-6)',
            textColor: 'orange',
          };
        case 'rate_limit':
          return {
            title: title || 'Rate Limit Exceeded',
            description: 'Too many requests have been made',
            borderColor: 'var(--mantine-color-yellow-6)',
            textColor: 'yellow',
          };
        case 'transient':
          return {
            title: title || 'Temporary Error',
            description: 'A temporary issue occurred, please try again',
            borderColor: 'var(--mantine-color-yellow-7)',
            textColor: 'yellow',
          };
        case 'permanent':
          return {
            title: title || 'Error',
            description: 'An error occurred while processing your request',
            borderColor: 'var(--mantine-color-red-7)',
            textColor: 'red',
          };
      }
    }

    // Fallback to errorType prop
    switch (errorType) {
      case 'permission':
        return {
          title: title || 'Permission Error',
          description: "You don't have sufficient permissions to access Kubernetes resources",
          borderColor: 'var(--mantine-color-orange-6)',
          textColor: 'orange',
        };
      case 'api':
        return {
          title: title || 'API Error',
          description: 'There was an issue connecting to the Kubernetes API',
          borderColor: 'var(--mantine-color-yellow-7)',
          textColor: 'yellow',
        };
      default:
        return {
          title: title || 'Error',
          description: 'An error occurred',
          borderColor: 'var(--mantine-color-gray-4)',
          textColor: 'dimmed',
        };
    }
  };

  const config = getErrorConfig();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const handleThemeChange = (newTheme: string | null) => {
    if (newTheme) {
      setColorScheme(newTheme as 'light' | 'dark' | 'auto');
    }
  };

  return (
    <Container size="xl" p="xl">
      <Group justify="space-between" align="flex-start" mb="xl" wrap="wrap">
        <Group gap="sm">
          <Image src="/images/logo.svg" alt="kube-ingress-dash logo" width={40} height={40} />
          <Title order={1} size="h2">
            kube-ingress-dash
          </Title>
        </Group>

        <Group gap="sm">
          <Text size="sm" fw={500}>
            Theme:
          </Text>
          <Select
            value={colorScheme}
            onChange={handleThemeChange}
            data={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'System' },
            ]}
            style={{ width: 120 }}
          />
        </Group>
      </Group>

      <Center style={{ minHeight: '50vh' }} p="md">
        <Card
          style={{ width: '100%', maxWidth: 768 }}
          padding="lg"
          radius="md"
          withBorder
          bd={`1px solid ${config.borderColor}`}
        >
          <Card.Section p="xl" ta="center">
            <Center mb="md">
              <Image src="/images/logo.svg" alt="kube-ingress-dash logo" width={64} height={64} />
            </Center>
            <Title order={2}>{config.title}</Title>
            <Text c="dimmed" size="sm">
              {config.description}
            </Text>
          </Card.Section>
          <Card.Section p="xl" pt={0} ta="center">
            <Text c={config.textColor} mb="xl">
              {smartMessage}
            </Text>

            <Group justify="center" gap="sm" wrap="wrap">
              {(onRetry || errorClassification?.retryable) && (
                <Button onClick={onRetry} variant="filled">
                  Retry Connection
                </Button>
              )}

              <Button
                component={Link}
                href={smartDocLink}
                target="_blank"
                variant="outline"
                rightSection={<ExternalLink className="h-4 w-4" />}
              >
                {smartDocText}
              </Button>
            </Group>
          </Card.Section>
        </Card>
      </Center>
    </Container>
  );
};

export default ErrorScreen;
