import { useState, useEffect, useCallback } from 'react';

export function useSearchSync() {
  const [isMounted, setIsMounted] = useState(false);

  // Initialize search query from URL parameter
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('q') || '';
    }
    return '';
  });

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Set mounted state after initial render
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearchQuery = urlParams.get('q') || '';
      if (urlSearchQuery !== searchQuery) {
        setSearchQuery(urlSearchQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL with search query
  useEffect(() => {
    if (!isMounted) return;

    const url = new URL(window.location.href);
    const currentQuery = url.searchParams.get('q') || '';

    if (searchQuery !== currentQuery) {
      if (searchQuery) {
        url.searchParams.set('q', searchQuery);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url);
    }
  }, [searchQuery, isMounted]);

  // Debounce effect for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    searchQuery,
    debouncedSearchQuery,
    handleSearch,
    isMounted,
  };
}
