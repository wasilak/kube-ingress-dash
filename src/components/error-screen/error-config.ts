import { ErrorClassification } from '@/types/errors';

export interface ErrorConfig {
  iconColor: string;
  title: string;
  description: string;
  border: string;
  text: string;
}

export function getErrorConfig(
  errorClassification: ErrorClassification | null,
  errorType: 'permission' | 'api' | 'generic',
  title?: string
): ErrorConfig {
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
}
