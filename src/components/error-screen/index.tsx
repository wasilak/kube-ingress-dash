'use client';

import React from 'react';
import { useTheme } from '@/components/theme-provider';
import { ErrorClassifier } from '@/lib/error-handler/classifier';
import { ErrorClassification } from '@/types/errors';
import { getErrorConfig } from './error-config';
import { ErrorScreenHeader } from './error-screen-header';
import { ErrorScreenCard } from './error-screen-card';

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
  const { theme, setTheme } = useTheme();

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

  const config = getErrorConfig(errorClassification, errorType, title);

  const handleThemeChange = (newTheme: string | null) => {
    if (newTheme) {
      setTheme(newTheme as 'light' | 'dark' | 'system');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <ErrorScreenHeader theme={theme} onThemeChange={handleThemeChange} />
      <ErrorScreenCard
        config={config}
        message={smartMessage}
        onRetry={onRetry}
        retryable={errorClassification?.retryable}
        documentationLink={smartDocLink}
        documentationText={smartDocText}
      />
    </div>
  );
};

export default ErrorScreen;
