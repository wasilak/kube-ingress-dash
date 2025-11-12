import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import KubernetesClient from '@/lib/k8s/client';
import { filterIngresses } from '@/lib/utils/ingress-transformer';

// Create a single instance of the Kubernetes client to reuse
const kubeClient = new KubernetesClient();

export async function GET(request: NextRequest) {
  try {
    // Check if the client has proper permissions
    const permissions = await kubeClient.checkPermissions();
    if (!permissions.hasPermissions) {
      console.error('Kubernetes client permissions error:', permissions.error);
      return NextResponse.json(
        { 
          error: 'Permission denied', 
          details: permissions.error 
        }, 
        { status: 403 }
      );
    }

    // Get namespace from query parameters if provided
    const namespace = request.nextUrl.searchParams.get('namespace') || undefined;
    
    // Get search term from query parameters if provided
    const searchTerm = request.nextUrl.searchParams.get('search') || undefined;

    // Fetch ingresses
    let ingresses = namespace 
      ? await kubeClient.getIngressesByNamespace(namespace)
      : await kubeClient.getIngresses();

    // Apply search filtering if search term is provided
    if (searchTerm) {
      ingresses = filterIngresses(ingresses, searchTerm);
    }

    return NextResponse.json({ 
      ingresses,
      timestamp: new Date().toISOString(),
      namespace: namespace || 'all'
    });
  } catch (error: any) {
    console.error('Error fetching ingresses:', error);
    
    // Check if it's a known error type
    if (error?.response?.statusCode) {
      return NextResponse.json(
        { 
          error: 'Kubernetes API error', 
          details: error?.response?.body?.message || error.message 
        }, 
        { status: error.response.statusCode }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
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