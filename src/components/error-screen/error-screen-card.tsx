import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className={`w-full max-w-2xl ${config.border}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo.svg"
              alt="kube-ingress-dash logo"
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className={`mb-6 ${config.text}`}>{message}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {(onRetry || retryable) && (
              <Button onClick={onRetry} variant="default">
                Retry Connection
              </Button>
            )}

            <Button asChild variant="outline">
              <Link href={documentationLink} target="_blank">
                {documentationText}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
