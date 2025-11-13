import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import KubernetesClient from '@/lib/k8s/client';
import { filterIngresses } from '@/lib/utils/ingress-transformer';
import { ErrorHandler } from '@/lib/utils/error-handler';

// Create a single instance of the Kubernetes client to reuse
const kubeClient = new KubernetesClient();

export async function GET(request: NextRequest) {
  try {
    // Check if the client has proper permissions
    const permissions = await kubeClient.checkPermissions();
    if (!permissions.hasPermissions) {
      const errorInfo = ErrorHandler.handle(
        new Error(permissions.error || 'Permission denied'),
        'Kubernetes API - Permissions Check',
        { hasPermissions: permissions.hasPermissions }
      );
      
      return NextResponse.json(
        {
          error: 'Permission denied',
          details: permissions.error || 'Insufficient permissions to access Kubernetes resources',
          errorInfo
        },
        { status: 403 }
      );
    }

    // Get namespace from query parameters if provided
    const namespace = request.nextUrl.searchParams.get('namespace') || undefined;
    
    // Get search term from query parameters if provided
    const searchTerm = request.nextUrl.searchParams.get('search') || undefined;

    // Fetch ingresses with enhanced error handling
    let ingresses;
    try {
      ingresses = namespace 
        ? await kubeClient.getIngressesByNamespace(namespace)
        : await kubeClient.getIngresses();
    } catch (k8sError: any) {
      const errorInfo = ErrorHandler.handleKubernetesError(
        k8sError,
        'GET /api/ingresses'
      );
      
      return NextResponse.json(
        {
          error: 'Failed to fetch ingresses from Kubernetes API',
          details: errorInfo.message,
          errorInfo
        },
        { status: 500 }
      );
    }

    // Apply search filtering if search term is provided
    if (searchTerm) {
      ingresses = filterIngresses(ingresses, searchTerm);
    }

    return NextResponse.json({ 
      ingresses,
      timestamp: new Date().toISOString(),
      namespace: namespace || 'all',
      count: ingresses.length
    });
  } catch (error: any) {
    const errorInfo = ErrorHandler.handle(
      error,
      'GET /api/ingresses',
      { userAgent: request.headers.get('user-agent') }
    );

    // For unknown errors, return a generic message to the client
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
        errorInfo
      },
      { status: 500 }
    );
  }
}

// Add POST method for any future functionality (might be needed for SSE/websocket setup)
export async function POST(request: NextRequest) {
  // For now, just return an error since this endpoint is primarily for reading data
  return NextResponse.json(
    { error: 'POST method not supported for this endpoint' }, 
    { status: 405 }
  );
}