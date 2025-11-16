import { useEffect } from 'react';
import { IngressData } from '@/types/ingress';

interface UseSSEStreamOptions {
  isMounted: boolean;
  selectedNamespaces: string[];
  error: string | null;
  onIngressUpdate: (updater: (prev: IngressData[]) => IngressData[]) => void;
  onError: (error: string) => void;
}

export function useSSEStream({
  isMounted,
  selectedNamespaces,
  error,
  onIngressUpdate,
  onError,
}: UseSSEStreamOptions) {
  useEffect(() => {
    if (!isMounted || error) return;

    let eventSource: EventSource | null = null;

    const setupEventSource = () => {
      const params = new URLSearchParams();
      if (
        selectedNamespaces.length > 0 &&
        !(selectedNamespaces.length === 1 && selectedNamespaces[0] === 'All')
      ) {
        const namespacesToUse = selectedNamespaces.filter((ns) => ns !== 'All');
        if (namespacesToUse.length > 0) {
          params.append('namespaces', namespacesToUse.join(','));
        }
      }

      const queryString = params.toString();
      const streamUrl = `/api/ingresses/stream${queryString ? `?${queryString}` : ''}`;

      try {
        eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { type, data: ingressData } = data;

            onIngressUpdate((prevIngresses) => {
              let newIngresses = [...prevIngresses];

              switch (type) {
                case 'ingressAdded': {
                  const exists = newIngresses.some(
                    (ing) =>
                      ing.name === ingressData.name && ing.namespace === ingressData.namespace
                  );
                  if (!exists) {
                    newIngresses.push(ingressData);
                  }
                  break;
                }

                case 'ingressModified': {
                  const index = newIngresses.findIndex(
                    (ing) =>
                      ing.name === ingressData.name && ing.namespace === ingressData.namespace
                  );
                  if (index !== -1) {
                    newIngresses[index] = ingressData;
                  } else {
                    newIngresses.push(ingressData);
                  }
                  break;
                }

                case 'ingressDeleted':
                  newIngresses = newIngresses.filter(
                    (ing) =>
                      !(ing.name === ingressData.name && ing.namespace === ingressData.namespace)
                  );
                  break;

                case 'error':
                  console.error('SSE Error:', ingressData);
                  onError(ingressData.error || ingressData.message || 'Kubernetes stream error');
                  if (eventSource) {
                    eventSource.close();
                  }
                  break;

                case 'done':
                  console.log('SSE connection closed:', ingressData);
                  break;

                default:
                  console.warn('Unknown event type:', type);
              }

              return newIngresses;
            });
          } catch (error) {
            console.error('Error processing SSE event:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error || 'Unknown SSE error');
          if (eventSource) {
            eventSource.close();
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
        if (eventSource) {
          eventSource.close();
        }
      }
    };

    setupEventSource();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isMounted, selectedNamespaces, error, onIngressUpdate, onError]);
}
