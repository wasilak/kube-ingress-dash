import { NextRequest } from 'next/server';
import KubernetesClient from '@/lib/k8s/client';
import { ErrorHandler } from '@/lib/utils/error-handler';

// Create a single instance of the Kubernetes client to reuse
const kubeClient = new KubernetesClient();

export const dynamic = 'force-dynamic'; // Disable Next.js caching for this endpoint

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Check if the client has proper permissions
      try {
        const permissions = await kubeClient.checkPermissions();
        if (!permissions.hasPermissions) {
          const errorInfo = ErrorHandler.handle(
            new Error(permissions.error || 'Permission denied'),
            'Kubernetes API - Permissions Check',
            { hasPermissions: permissions.hasPermissions }
          );

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            data: {
              error: 'Permission denied',
              details: permissions.error || 'Insufficient permissions to access Kubernetes resources',
              errorInfo
            }
          })}\n\n`));

          controller.close();
          return;
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(
          error as Error,
          'GET /api/ingresses/stream'
        );

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          data: {
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
            details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
            errorInfo
          }
        })}\n\n`));

        controller.close();
        return;
      }

      // Create a callback for watch events
      const handleEvent = (type: string, ingress: unknown) => {
        try {
          let eventType;
          switch (type) {
            case 'ADDED':
              eventType = 'ingressAdded';
              break;
            case 'MODIFIED':
              eventType = 'ingressModified';
              break;
            case 'DELETED':
              eventType = 'ingressDeleted';
              break;
            default:
              eventType = 'ingressUnknown';
          }

          const event = {
            type: eventType,
            data: ingress,
            timestamp: new Date().toISOString()
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch (error) {
          console.error('Error in watch callback:', error);
          const errorInfo = ErrorHandler.handle(
            error as Error,
            'Watch callback error'
          );

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            data: {
              error: 'Watch callback error',
              message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
              details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
              errorInfo
            }
          })}\n\n`));
        }
      };

      // Create error callback
      const handleError = (error: Error) => {
        console.error('Watch error:', error);

        const errorInfo = ErrorHandler.handle(
          error,
          'Kubernetes watch error'
        );

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          data: {
            error: 'Watch error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while watching resources',
            details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while watching resources',
            errorInfo
          }
        })}\n\n`));

        // Don't close the connection - try to reconnect after a delay
        setTimeout(() => {
          // Re-establish the watch
          startWatch();
        }, 5000); // Retry after 5 seconds
      };

      // Create done callback
      const handleDone = () => {
        console.log('Watch connection closed');
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'done',
          data: { message: 'Watch connection closed' }
        })}\n\n`));
      };

      // Function to start the watch
      const startWatch = async () => {
        try {
          // Get namespaces from query parameters if provided
          const url = new URL(request.url || '');
          const namespace = url.searchParams.get('namespace') || undefined;
          const namespacesParam = url.searchParams.get('namespaces');
          let namespaces: string[] | undefined;
          if (namespacesParam) {
            namespaces = namespacesParam.split(',').map(ns => ns.trim()).filter(ns => ns);
          }

          if (namespaces && namespaces.length > 0) {
            // Watch multiple specific namespaces - for simplicity, we'll watch the first namespace
            // For a full implementation, we'd need to watch multiple namespaces in parallel
            await kubeClient.watchIngressesByNamespace(
              namespaces[0], 
              handleEvent, 
              handleDone, 
              handleError
            );
          } else if (namespace) {
            // Watch single namespace
            await kubeClient.watchIngressesByNamespace(
              namespace, 
              handleEvent, 
              handleDone, 
              handleError
            );
          } else {
            // Watch all namespaces
            await kubeClient.watchIngresses(
              handleEvent, 
              handleDone, 
              handleError
            );
          }
        } catch (error) {
          console.error('Error starting watch:', error);
          const errorInfo = ErrorHandler.handle(
            error as Error,
            'Error starting Kubernetes watch'
          );

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            data: {
              error: 'Failed to start watch',
              message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred while starting the watch',
              details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred while starting the watch',
              errorInfo
            }
          })}\n\n`));
        }
      };

      // Start watching
      startWatch();
    },

    cancel() {
      console.log('Stream cancelled by client');
    }
  });

  // Return the stream with appropriate headers for SSE
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}