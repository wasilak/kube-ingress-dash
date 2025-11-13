'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              variant="outline" 
              onClick={() => router.refresh()}
            >
              Try Again
            </Button>
            <Button 
              onClick={() => router.push('/')}
            >
              Go Home
            </Button>
            <Button 
              onClick={reset}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}