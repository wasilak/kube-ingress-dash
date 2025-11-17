'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Title } from '@mantine/core';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Error occurred:', error);
  }, [error]);

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
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" onClick={() => router.refresh()}>
              Try Again
            </Button>
            <Button variant="filled" onClick={() => router.push('/')}>
              Go Home
            </Button>
            <Button variant="filled" onClick={reset}>
              Reset
            </Button>
          </div>
        </Card.Section>
      </Card>
    </div>
  );
}
