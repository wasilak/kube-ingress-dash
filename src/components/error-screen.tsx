'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
            iconColor: 'text-red-500',
            title: title || 'Authentication Error',
            description: 'Authentication is required to access this resource',
            border: 'border-red-500',
            text: 'text-red-500',
          };
        case 'authorization':
          return {
            iconColor: 'text-orange-500',
            title: title || 'Permission Error',
            description: "You don't have sufficient permissions to access Kubernetes resources",
            border: 'border-orange-500',
            text: 'text-orange-500',
          };
        case 'rate_limit':
          return {
            iconColor: 'text-yellow-500',
            title: title || 'Rate Limit Exceeded',
            description: 'Too many requests have been made',
            border: 'border-yellow-500',
            text: 'text-yellow-500',
          };
        case 'transient':
          return {
            iconColor: 'text-amber-500',
            title: title || 'Temporary Error',
            description: 'A temporary issue occurred, please try again',
            border: 'border-amber-500',
            text: 'text-amber-500',
          };
        case 'permanent':
          return {
            iconColor: 'text-red-600',
            title: title || 'Error',
            description: 'An error occurred while processing your request',
            border: 'border-red-600',
            text: 'text-red-600',
          };
      }
    }

    // Fallback to errorType prop
    switch (errorType) {
      case 'permission':
        return {
          iconColor: 'text-orange-500',
          title: title || 'Permission Error',
          description: "You don't have sufficient permissions to access Kubernetes resources",
          border: 'border-orange-500',
          text: 'text-orange-500',
        };
      case 'api':
        return {
          iconColor: 'text-amber-500',
          title: title || 'API Error',
          description: 'There was an issue connecting to the Kubernetes API',
          border: 'border-amber-500',
          text: 'text-amber-500',
        };
      default:
        return {
          iconColor: 'text-muted-foreground',
          title: title || 'Error',
          description: 'An error occurred',
          border: 'border-input',
          text: 'text-muted-foreground',
        };
    }
  };

  const config = getErrorConfig();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <div>
            <Image
              src="/images/logo.svg"
              alt="kube-ingress-dash logo"
              width={40}
              height={40}
              className="text-muted-foreground"
            />
          </div>
          <h1 className="text-3xl font-bold">kube-ingress-dash</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="theme-select">Theme:</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme-select" className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
            <p className={`mb-6 ${config.text}`}>{smartMessage}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {(onRetry || errorClassification?.retryable) && (
                <Button onClick={onRetry} variant="default">
                  Retry Connection
                </Button>
              )}

              <Button asChild variant="outline">
                <Link href={smartDocLink} target="_blank">
                  {smartDocText}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ErrorScreen;
