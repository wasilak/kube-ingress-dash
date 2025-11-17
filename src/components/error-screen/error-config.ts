import { ErrorClassification } from '@/types/errors';

export interface ErrorConfig {
  title: string;
  description: string;
  borderColor: string;
  textColor: string;
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
}
