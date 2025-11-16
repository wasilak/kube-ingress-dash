import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import KubernetesClient from '@/lib/k8s/client';
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

    // Fetch namespaces with enhanced error handling
    let namespaces;
    try {
      const namespaceResponse = await kubeClient.getNamespaces();
      namespaces = namespaceResponse.items.map(ns => ns.metadata?.name || '').filter(name => name);
    } catch (k8sError: unknown) {
      const errorInfo = ErrorHandler.handleKubernetesError(
        k8sError,
        'GET /api/namespaces'
      );

      return NextResponse.json(
        {
          error: 'Failed to fetch namespaces from Kubernetes API',
          details: errorInfo.message,
          errorInfo
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      namespaces,
      timestamp: new Date().toISOString(),
      count: namespaces.length
    });
  } catch (error: unknown) {
    const err = error as Error;
    const errorInfo = ErrorHandler.handle(
      err,
      'GET /api/namespaces',
      { userAgent: request.headers.get('user-agent') }
    );

    // For unknown errors, return a generic message to the client
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
        errorInfo
      },
      { status: 500 }
    );
  }
}