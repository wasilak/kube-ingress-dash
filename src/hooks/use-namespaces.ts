import { useState, useEffect, useMemo } from 'react';
import { IngressData } from '@/types/ingress';
import { ErrorHandler } from '@/lib/error-handler';

interface UseNamespacesOptions {
  isMounted: boolean;
  error: string | null;
  ingresses: IngressData[];
}

export function useNamespaces({ isMounted, error, ingresses }: UseNamespacesOptions) {
  const [allNamespaces, setAllNamespaces] = useState<string[]>([]);
  const [namespaceLoading, setNamespaceLoading] = useState(true);

  // Calculate namespace counts
  const namespaceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ingresses.forEach((ing) => {
      counts[ing.namespace] = (counts[ing.namespace] || 0) + 1;
    });
    return counts;
  }, [ingresses]);

  // Return all namespaces from the API
  // The API already filters to only return namespaces with ingresses
  // Don't filter based on the ingresses list since that's already filtered by selectedNamespaces
  const namespacesWithIngresses = useMemo(() => allNamespaces, [allNamespaces]);

  // Fetch all namespaces when component mounts
  useEffect(() => {
    if (!isMounted || error) return;

    const fetchNamespaces = async () => {
      try {
        setNamespaceLoading(true);
        const response = await fetch('/api/namespaces');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.details || 'Failed to fetch namespaces');
        }

        const data = await response.json();
        setAllNamespaces(data.namespaces || []);
      } catch (err: unknown) {
        const error = err as Error;
        ErrorHandler.handle(error, 'fetchNamespaces');
        console.error('Failed to fetch namespaces:', err);

        if (
          error.message &&
          (error.message.includes('Permission') ||
            error.message.toLowerCase().includes('forbidden'))
        ) {
          throw error;
        } else {
          setAllNamespaces([]);
        }
      } finally {
        setNamespaceLoading(false);
      }
    };

    fetchNamespaces();
  }, [isMounted, error]);

  return {
    allNamespaces,
    namespaceLoading,
    namespaceCounts,
    namespacesWithIngresses,
  };
}
