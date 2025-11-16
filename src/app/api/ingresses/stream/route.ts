import { NextRequest } from 'next/server';
import KubernetesClient from '@/lib/k8s/client';
import { MultiNamespaceStreamManager } from '@/lib/k8s/multi-namespace-stream';
import { ErrorHandler } from '@/lib/utils/error-handler';

// Create a single instance of the Kubernetes client to reuse
const kubeClient = new KubernetesClient();

export const dynamic = 'force-dynamic'; // Disable Next.js caching for this endpoint

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  // Performance optimization: TextEncoder is created once and reused for all events
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      // Parse query parameters to determine which namespaces to watch
      const url = new URL(request.url || '');
      const singleNamespace = url.searchParams.get('namespace');
      const namespacesParam = url.searchParams.get('namespaces');
      
      // Determine the list of namespaces to watch
      let namespacesToWatch: string[] = [];
      let useMultiNamespace = false;
      
      if (namespacesParam) {
        // Multiple namespaces provided via 'namespaces' parameter
        namespacesToWatch = namespacesParam
          .split(',')
          .map(ns => ns.trim())
          .filter(ns => ns);
        useMultiNamespace = namespacesToWatch.length > 0;
      } else if (singleNamespace) {
        // Single namespace provided via 'namespace' parameter (backward compatibility)
        namespacesToWatch = [singleNamespace];
        useMultiNamespace = true;
      }
      
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

      // Variable to hold the stream manager for cleanup
      let streamManager: MultiNamespaceStreamManager | null = null;

      if (useMultiNamespace) {
        // Use multi-namespace stream manager for specific namespace(s)
        streamManager = new MultiNamespaceStreamManager();

        // Register event handler for multi-namespace events
        streamManager.onEvent((event) => {
          try {
            // Map event types efficiently using a lookup object
            const eventTypeMap: Record<string, string> = {
              'ADDED': 'ingressAdded',
              'MODIFIED': 'ingressModified',
              'DELETED': 'ingressDeleted'
            };
            
            const eventType = eventTypeMap[event.type] || 'ingressUnknown';

            // Pre-serialize the event structure for optimal performance
            // This reduces the overhead of JSON.stringify by preparing the structure
            const streamEvent = {
              type: eventType,
              data: event.ingress,
              namespace: event.namespace,
              timestamp: event.timestamp,
              // Add server timestamp for latency tracking
              serverTimestamp: new Date().toISOString()
            };

            // Optimize serialization by using a single JSON.stringify call
            const serialized = `data: ${JSON.stringify(streamEvent)}\n\n`;
            controller.enqueue(encoder.encode(serialized));
          } catch (error) {
            console.error('Error in multi-namespace watch callback:', error);
            const errorInfo = ErrorHandler.handle(
              error as Error,
              'Watch callback error'
            );

            const errorEvent = {
              type: 'error',
              data: {
                error: 'Watch callback error',
                message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
                errorInfo
              },
              timestamp: new Date().toISOString()
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          }
        });

        // Register error handler for multi-namespace errors
        streamManager.onError((error, namespace) => {
          console.error(`Watch error in namespace ${namespace}:`, error);

          const errorInfo = ErrorHandler.handle(
            error,
            `Kubernetes watch error - namespace: ${namespace}`
          );

          const errorEvent = {
            type: 'error',
            data: {
              error: 'Watch error',
              namespace,
              message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while watching resources',
              details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while watching resources',
              errorInfo
            },
            timestamp: new Date().toISOString()
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        });

        // Start watching the specified namespaces
        try {
          await streamManager.startWatching(namespacesToWatch);
          console.log(`Started watching namespaces: ${namespacesToWatch.join(', ')}`);
        } catch (error) {
          console.error('Error starting multi-namespace watch:', error);
          const errorInfo = ErrorHandler.handle(
            error as Error,
            'Error starting multi-namespace Kubernetes watch'
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
      } else {
        // No specific namespaces - watch all namespaces using legacy method
        const handleEvent = (type: string, ingress: unknown) => {
          try {
            // Map event types efficiently using a lookup object
            const eventTypeMap: Record<string, string> = {
              'ADDED': 'ingressAdded',
              'MODIFIED': 'ingressModified',
              'DELETED': 'ingressDeleted'
            };
            
            const eventType = eventTypeMap[type] || 'ingressUnknown';

            // Pre-serialize the event structure for optimal performance
            const event = {
              type: eventType,
              data: ingress,
              timestamp: new Date().toISOString(),
              // Add server timestamp for latency tracking
              serverTimestamp: new Date().toISOString()
            };

            // Optimize serialization by using a single JSON.stringify call
            const serialized = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(serialized));
          } catch (error) {
            console.error('Error in watch callback:', error);
            const errorInfo = ErrorHandler.handle(
              error as Error,
              'Watch callback error'
            );

            const errorEvent = {
              type: 'error',
              data: {
                error: 'Watch callback error',
                message: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
                details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred',
                errorInfo
              },
              timestamp: new Date().toISOString()
            };

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          }
        };

        const handleError = (error: Error) => {
          console.error('Watch error:', error);

          const errorInfo = ErrorHandler.handle(
            error,
            'Kubernetes watch error'
          );

          const errorEvent = {
            type: 'error',
            data: {
              error: 'Watch error',
              message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while watching resources',
              details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred while watching resources',
              errorInfo
            },
            timestamp: new Date().toISOString()
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        };

        const handleDone = () => {
          console.log('Watch connection closed');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            data: { message: 'Watch connection closed' }
          })}\n\n`));
        };

        try {
          await kubeClient.watchIngresses(handleEvent, handleDone, handleError);
          console.log('Started watching all namespaces');
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
      }
    },

    cancel() {
      console.log('Stream cancelled by client');
      // Cleanup will be handled by the stream manager's internal mechanisms
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