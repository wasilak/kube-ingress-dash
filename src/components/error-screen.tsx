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

interface ErrorScreenProps {
  title?: string;
  message: string;
  errorType?: 'permission' | 'api' | 'generic';
  documentationLink?: string;
  documentationText?: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = 'Access Error',
  message,
  errorType = 'generic',
  documentationLink = '/docs/architecture/rbac-setup',
  documentationText = 'RBAC Setup Documentation',
  onRetry
}) => {
  // Determine the icon and color scheme based on error type
  const getErrorConfig = () => {
    switch (errorType) {
      case 'permission':
        return {
          iconColor: 'text-orange-500',
          title: title || 'Permission Error',
          description: 'You don\'t have sufficient permissions to access Kubernetes resources',
          border: 'border-orange-500',
          text: 'text-orange-500'
        };
      case 'api':
        return {
          iconColor: 'text-amber-500',
          title: title || 'API Error',
          description: 'There was an issue connecting to the Kubernetes API',
          border: 'border-amber-500',
          text: 'text-amber-500'
        };
      default:
        return {
          iconColor: 'text-muted-foreground',
          title: title || 'Error',
          description: 'An error occurred',
          border: 'border-input',
          text: 'text-muted-foreground'
        };
    }
  };

  const config = getErrorConfig();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
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
            <CardDescription>
              {config.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className={`mb-6 ${config.text}`}>
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onRetry && (
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
    </div>
  );
};

export default ErrorScreen;