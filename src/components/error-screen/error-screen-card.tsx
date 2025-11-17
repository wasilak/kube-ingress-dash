import React from 'react';
import { Button, Card, Text, Title } from '@mantine/core';
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
    <div className="flex justify-center items-center min-h-[50vh] p-4">
      <Card className={`w-full max-w-2xl ${config.border}`} padding="lg" radius="md" withBorder>
        <Card.Section className="text-center p-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo.svg"
              alt="kube-ingress-dash logo"
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </div>
          <Title order={2} className="text-2xl">
            {config.title}
          </Title>
          <Text c="dimmed" size="sm">
            {config.description}
          </Text>
        </Card.Section>
        <Card.Section className="text-center p-6 pt-0">
          <p className={`mb-6 ${config.text}`}>{message}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
          </div>
        </Card.Section>
      </Card>
    </div>
  );
};
