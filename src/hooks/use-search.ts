import { useState, useMemo } from 'react';
import { IngressData } from '@/types/ingress';

interface UseSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredData: IngressData[];
}

const useSearch = (data: IngressData[]): UseSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) {
      return data;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return data.filter(ingress => {
      // Search in name, namespace, hosts, paths, and annotations
      return (
        ingress.name.toLowerCase().includes(query) ||
        ingress.namespace.toLowerCase().includes(query) ||
        ingress.hosts.some(host => host.toLowerCase().includes(query)) ||
        ingress.paths.some(path => path.toLowerCase().includes(query)) ||
        Object.values(ingress.annotations).some(annot => 
          annot.toLowerCase().includes(query)
        ) ||
        ingress.urls.some(url => url.toLowerCase().includes(query))
      );
    });
  }, [data, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
  };
};

export default useSearch;