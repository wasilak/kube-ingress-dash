import { useState, useEffect, useCallback } from 'react';
import { IngressData } from '@/types/ingress';
import { ErrorHandler } from '@/lib/error-handler';
import {
  getAllLabels,
  getAllAnnotations,
  filterIngressesAdvanced,
} from '@/lib/utils/ingress-transformer';

interface UseIngressesOptions {
  searchQuery: string;
  selectedNamespaces: string[];
  selectedLabels: string[];
  selectedAnnotations: string[];
  isMounted: boolean;
  error: string | null;
}

export function useIngresses({
  searchQuery,
  selectedNamespaces,
  selectedLabels,
  selectedAnnotations,
  isMounted,
  error,
}: UseIngressesOptions) {
  const [ingresses, setIngresses] = useState<IngressData[]>([]);
  const [filteredIngresses, setFilteredIngresses] = useState<IngressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [allLabels, setAllLabels] = useState<string[]>([]);
  const [allAnnotations, setAllAnnotations] = useState<string[]>([]);

  // Fetch ingress data from API
  useEffect(() => {
    if (!isMounted || error) return;

    const fetchIngresses = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (searchQuery) {
          params.append('search', searchQuery);
        }

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
        const apiUrl = `/api/ingresses${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.details || 'Failed to fetch ingresses');
        }

        const data = await response.json();
        setIngresses(data.ingresses);
        setAllLabels(getAllLabels(data.ingresses));
        setAllAnnotations(getAllAnnotations(data.ingresses));

        const filtered = filterIngressesAdvanced(
          data.ingresses,
          searchQuery,
          selectedLabels,
          selectedAnnotations
        );
        setFilteredIngresses(filtered);
      } catch (err: unknown) {
        const error = err as Error;
        ErrorHandler.handle(error, 'fetchIngresses');
        throw error;
      } finally {
        setLoading(false);
      }
    };

    fetchIngresses();
  }, [searchQuery, isMounted, selectedLabels, selectedAnnotations, selectedNamespaces, error]);

  // Apply advanced filtering when filters change
  useEffect(() => {
    if (!isMounted || ingresses.length === 0) return;

    const filtered = filterIngressesAdvanced(
      ingresses,
      searchQuery,
      selectedLabels,
      selectedAnnotations
    );
    setFilteredIngresses(filtered);
  }, [selectedLabels, selectedAnnotations, ingresses, searchQuery, isMounted]);

  const updateIngresses = useCallback((updater: (prev: IngressData[]) => IngressData[]) => {
    setIngresses(updater);
  }, []);

  return {
    ingresses,
    filteredIngresses,
    loading,
    allLabels,
    allAnnotations,
    updateIngresses,
  };
}
