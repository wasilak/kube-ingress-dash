'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SearchBar from '@/components/search-bar';
import IngressCard from '@/components/ingress-card';
import { IngressData } from '@/types/ingress';
import { useTheme } from '@/components/theme-provider';
import { Loader2, Server, Database, Network } from 'lucide-react';

export default function DashboardPage() {
  const [ingresses, setIngresses] = useState<IngressData[]>([]);
  const [filteredIngresses, setFilteredIngresses] = useState<IngressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme: setThemeState } = useTheme();

  // State to track if component has mounted (for hydration)
  const [isMounted, setIsMounted] = useState(false);

  // Initialize search query from URL parameter - using functional state init to ensure it happens correctly
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    // Only run on the client side after mount to avoid hydration issues
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('q') || '';
    }
    return '';
  });

  // Set mounted state after initial render to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
    
    // Update the search query after mounting, in case it wasn't set properly during initial render
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearchQuery = urlParams.get('q') || '';
      if (urlSearchQuery !== searchQuery) {
        setSearchQuery(urlSearchQuery);
      }
    }
  }, []);

  // Kubernetes context information (simulated - would come from API in real implementation)
  const [k8sContext, setK8sContext] = useState({
    cluster: "default-cluster",
    namespace: "all",
    context: "default"
  });

  // Fetch ingress data from API - now depends on searchQuery which is initialized properly
  useEffect(() => {
    if (!isMounted) return; // Don't run until mounted to avoid hydration issues
    
    const fetchIngresses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/ingresses${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch ingresses");
        }
        
        const data = await response.json();
        setIngresses(data.ingresses);
        setFilteredIngresses(data.ingresses);
      } catch (err: any) {
        console.error("Error fetching ingresses:", err);
        setError(err.message || "An error occurred while fetching ingress data");
      } finally {
        setLoading(false);
      }
    };

    fetchIngresses();
  }, [searchQuery, isMounted]);

  // Update URL with search query using standard Web API
  useEffect(() => {
    if (!isMounted) return; // Don't run until mounted to avoid hydration issues
    
    const url = new URL(window.location.href);
    if (searchQuery) {
      url.searchParams.set('q', searchQuery);
    } else {
      url.searchParams.delete('q');
    }
    // Use replaceState to update the URL without adding history entry
    window.history.replaceState({}, '', url);
  }, [searchQuery, isMounted]);

  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Update theme state to match theme provider
  const handleThemeChange = (newTheme: string) => {
    setThemeState(newTheme as "light" | "dark" | "system");
  };

  // Calculate stats
  const totalIngresses = ingresses.length;
  const tlsIngresses = ingresses.filter(ingress => ingress.tls).length;
  const nonTlsIngresses = totalIngresses - tlsIngresses;
  const filteredCount = filteredIngresses.length;

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-lg">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-destructive/20 border border-destructive text-destructive p-4 rounded-md">
            <h2 className="text-xl font-bold">Error</h2>
            <p>{error}</p>
            <Button 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Network className="h-5 w-5" />
              <h1 className="text-3xl font-bold">kube-ingress-dash</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Server className="h-4 w-4" />
                {k8sContext.cluster}
              </span>
              <span className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                {k8sContext.namespace}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="theme-select">Theme:</Label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger id="theme-select" className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="mb-6 flex-1">
            <SearchBar 
              onSearch={handleSearch} 
              value={searchQuery}
              placeholder="Search ingresses by name, namespace, host, or path..." 
            />
          </div>
          
          {/* Stats display */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span>Ingresses: {totalIngresses}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>TLS: {tlsIngresses}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <span>Not TLS: {nonTlsIngresses}</span>
            </div>
            <div className="text-muted-foreground">
              Showing: {filteredCount}/{totalIngresses}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-lg">Loading ingresses...</span>
            </div>
          </div>
        ) : filteredIngresses.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold">No ingresses found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery ? `No ingresses match your search for "${searchQuery}"` : "There are no ingresses in your cluster"}
            </p>
            {searchQuery && (
              <Button 
                className="mt-4" 
                onClick={() => handleSearch("")}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIngresses.map((ingress) => (
              <IngressCard 
                key={`${ingress.namespace}/${ingress.name}`} 
                ingress={ingress} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}