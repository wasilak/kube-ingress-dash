import React from 'react';
import { Button, Card, Text, Title, Center, Group } from '@mantine/core';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ErrorConfig } from './error-config';

interface ErrorScreenCardProps {
  config: ErrorConfig;
  message: string;
  onRetry?: () => void;
  retryable?: boolean;
  documentationLink: string;
  documentationText: string;
}

export const ErrorScreenCard: React.FC<ErrorScreenCardProps> = ({
  config,
  message,
  onRetry,
  retryable,
  documentationLink,
  documentationText,
}) => {
  return (
    <Center style={{ minHeight: '50vh' }} p="md">
      <Card
        style={{
          width: '100%',
          maxWidth: 768,
          border: `1px solid ${config.borderColor || 'var(--mantine-color-default-border)'}`,
        }}
        padding="lg"
        radius="md"
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
            {message}
          </Text>

          <Group justify="center" gap="sm" wrap="wrap">
            {(onRetry || retryable) && (
              <Button onClick={onRetry} variant="filled">
                Retry Connection
              </Button>
            )}

            <Button
              component={Link}
              href={documentationLink}
              target="_blank"
              variant="outline"
              rightSection={<ExternalLink className="h-4 w-4" />}
            >
              {documentationText}
            </Button>
          </Group>
        </Card.Section>
      </Card>
    </Center>
  );
};
