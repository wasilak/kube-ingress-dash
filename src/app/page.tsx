'use client';

import React, { useState, useEffect } from 'react';
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
import ErrorBoundary from '@/components/error-boundary';
import { MultiSelect } from '@/components/multi-select';
import { NamespaceFilter } from '@/components/ui/namespace-filter';
import { getAllLabels, getAllAnnotations, filterIngressesAdvanced } from '@/lib/utils/ingress-transformer';
import Image from 'next/image';
import { ErrorHandler } from '@/lib/error-handler';
import ErrorScreen from '@/components/error-screen';
import { Loader2, Server, Database, Filter } from 'lucide-react';

export default function DashboardPage() {
  const [ingresses, setIngresses] = useState<IngressData[]>([]);
  const [filteredIngresses, setFilteredIngresses] = useState<IngressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme: setThemeState } = useTheme();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState<string[]>([]);
  const [allLabels, setAllLabels] = useState<string[]>([]);
  const [allAnnotations, setAllAnnotations] = useState<string[]>([]);
  const [allNamespaces, setAllNamespaces] = useState<string[]>([]);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceLoading, setNamespaceLoading] = useState(true);

  // Memoize options to prevent unnecessary re-renders
  const labelOptions = React.useMemo(
    () => allLabels.map(label => ({ value: label, label: label })),
    [allLabels]
  );
  
  const annotationOptions = React.useMemo(
    () => allAnnotations.map(annotation => ({ value: annotation, label: annotation })),
    [allAnnotations]
  );

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
    // Only run once on mount
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearchQuery = urlParams.get('q') || '';
      if (urlSearchQuery !== searchQuery) {
        setSearchQuery(urlSearchQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch all namespaces when component mounts
  useEffect(() => {
    if (!isMounted || error) return; // Don't fetch namespaces if there's an error

    const fetchNamespaces = async () => {
      try {
        setNamespaceLoading(true);
        // Use the API to fetch namespaces instead of direct Kubernetes client
        const response = await fetch('/api/namespaces');

        if (!response.ok) {
          const errorData = await response.json();
          // Don't throw error if it's a permission issue - just set error state
          setError(errorData.error || errorData.details || "Failed to fetch namespaces");
          return; // Exit early to avoid setting data
        }

        const data = await response.json();
        setAllNamespaces(data.namespaces || []);
      } catch (err: any) {
        ErrorHandler.handle(err, "fetchNamespaces");
        console.error("Failed to fetch namespaces:", err);

        // Check if it's a permission or API error and set appropriate error state
        if (err.message && (err.message.includes('Permission') || err.message.toLowerCase().includes('forbidden'))) {
          setError(err.message || 'Permission error: Unable to access Kubernetes namespaces');
        } else {
          // Still set loading to false so the app doesn't hang
          // Set an empty array as fallback
          setAllNamespaces([]);
        }
      } finally {
        setNamespaceLoading(false);
      }
    };

    fetchNamespaces();
  }, [isMounted, error]); // Added error to the dependency array

  // Kubernetes context information (simulated - would come from API in real implementation)
  const [k8sContext, setK8sContext] = useState({
    cluster: "default-cluster",
    namespace: "all",
    context: "default"
  });

  // Update k8sContext based on selected namespaces
  useEffect(() => {
    if (selectedNamespaces.length === 0 || (selectedNamespaces.length === 1 && selectedNamespaces[0] === "All")) {
      setK8sContext(prev => ({...prev, namespace: "All namespaces"}));
    } else {
      setK8sContext(prev => ({...prev, namespace: selectedNamespaces.join(', ') || "all"}));
    }
  }, [selectedNamespaces]);

  // Set up real-time updates via Server-Sent Events
  useEffect(() => {
    if (!isMounted || error) return; // Don't start SSE if there's an error

    let eventSource: EventSource | null = null;

    const setupEventSource = () => {
      // Build query parameters for the SSE endpoint
      const params = new URLSearchParams();
      if (selectedNamespaces.length > 0 && !(selectedNamespaces.length === 1 && selectedNamespaces[0] === "All")) {
        // Add the selected namespaces as a parameter, filtering out "All" if present
        const namespacesToUse = selectedNamespaces.filter(ns => ns !== "All");
        if (namespacesToUse.length > 0) {
          params.append('namespaces', namespacesToUse.join(','));
        }
      }

      const queryString = params.toString();
      const streamUrl = `/api/ingresses/stream${queryString ? `?${queryString}` : ""}`;

      try {
        eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { type, data: ingressData } = data;

            // Update ingresses based on the event type
            setIngresses(prevIngresses => {
              let newIngresses = [...prevIngresses];

              switch (type) {
                case 'ingressAdded':
                  // Add the new ingress if it's not already in the list
                  const exists = newIngresses.some(ing =>
                    ing.name === ingressData.name && ing.namespace === ingressData.namespace
                  );
                  if (!exists) {
                    newIngresses.push(ingressData);
                  }
                  break;

                case 'ingressModified':
                  // Update the ingress if it exists, otherwise add it
                  const index = newIngresses.findIndex(ing =>
                    ing.name === ingressData.name && ing.namespace === ingressData.namespace
                  );
                  if (index !== -1) {
                    newIngresses[index] = ingressData;
                  } else {
                    newIngresses.push(ingressData);
                  }
                  break;

                case 'ingressDeleted':
                  // Remove the ingress from the list
                  newIngresses = newIngresses.filter(ing =>
                    !(ing.name === ingressData.name && ing.namespace === ingressData.namespace)
                  );
                  break;

                case 'error':
                  console.error('SSE Error:', ingressData);
                  // Set error state to show the error screen
                  setError(ingressData.error || ingressData.message || 'Kubernetes stream error');
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
          // Don't attempt to reconnect when there's an error state, just close
          if (eventSource) {
            eventSource.close();
          }
        };
      } catch (error) {
        console.error('Failed to create EventSource:', error);
        // Don't retry if there's an error state
        if (eventSource) {
          eventSource.close();
        }
      }
    };

    setupEventSource();

    // Cleanup function to close the event source
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isMounted, selectedNamespaces, error]); // Added error to the dependency array

  // Fetch ingress data from API - now depends on searchQuery which is initialized properly
  useEffect(() => {
    if (!isMounted || error) return; // Don't fetch ingresses if there's an error

    const fetchIngresses = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();

        // Add search query if present
        if (searchQuery) {
          params.append('search', searchQuery);
        }

        // Add namespace filter if present
        if (selectedNamespaces.length > 0 && !(selectedNamespaces.length === 1 && selectedNamespaces[0] === "All")) {
          // Add the selected namespaces as a parameter, filtering out "All" if present
          const namespacesToUse = selectedNamespaces.filter(ns => ns !== "All");
          if (namespacesToUse.length > 0) {
            params.append('namespaces', namespacesToUse.join(','));
          }
        }
        // If no namespaces are selected or "All" is selected, no parameter is added, which means "all namespaces" by default

        const queryString = params.toString();
        const apiUrl = `/api/ingresses${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json();
          // Don't throw error if it's a permission issue - just set error state
          setError(errorData.error || errorData.details || "Failed to fetch ingresses");
          return; // Exit early to avoid setting data
        }

        const data = await response.json();
        setIngresses(data.ingresses);

        // Update all available labels and annotations when ingresses change
        setAllLabels(getAllLabels(data.ingresses));
        setAllAnnotations(getAllAnnotations(data.ingresses));

        // Apply advanced filtering with current selections
        const filtered = filterIngressesAdvanced(data.ingresses, searchQuery, selectedLabels, selectedAnnotations);
        setFilteredIngresses(filtered);
      } catch (err: any) {
        ErrorHandler.handle(err, "fetchIngresses");
        setError(err.message || "An error occurred while fetching ingress data");
      } finally {
        setLoading(false);
      }
    };

    fetchIngresses();
  }, [searchQuery, isMounted, selectedLabels, selectedAnnotations, selectedNamespaces, error]); // Added error to the dependency array

  // Apply advanced filtering when selectedLabels or selectedAnnotations change
  useEffect(() => {
    if (!isMounted || ingresses.length === 0) return; // Don't run until mounted and ingresses are loaded
    
    const filtered = filterIngressesAdvanced(ingresses, searchQuery, selectedLabels, selectedAnnotations);
    setFilteredIngresses(filtered);
  }, [selectedLabels, selectedAnnotations, ingresses, searchQuery, isMounted]);

  // Update URL with search query using standard Web API
  useEffect(() => {
    if (!isMounted) return; // Don't run until mounted to avoid hydration issues
    
    const url = new URL(window.location.href);
    const currentQuery = url.searchParams.get('q') || '';
    
    // Only update URL if it's different from current search query
    if (searchQuery !== currentQuery) {
      if (searchQuery) {
        url.searchParams.set('q', searchQuery);
      } else {
        url.searchParams.delete('q');
      }
      // Use replaceState to update the URL without adding history entry
      window.history.replaceState({}, '', url);
    }
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
    // Determine the type of error to display appropriate message
    let errorType: 'permission' | 'api' | 'generic' = 'generic';
    let errorTitle = 'Error';
    let errorMessage = error;

    // Check if the error is related to permissions
    if (error.toLowerCase().includes('permission') || error.toLowerCase().includes('forbidden')) {
      errorType = 'permission';
      errorTitle = 'Permission Error';
      errorMessage = 'You don\'t have sufficient permissions to access Kubernetes resources. Check your RBAC configuration.';
    } else if (error.toLowerCase().includes('api') || error.toLowerCase().includes('kubernetes')) {
      errorType = 'api';
      errorTitle = 'API Error';
      errorMessage = 'There was an issue connecting to the Kubernetes API. Please check your cluster configuration.';
    }

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background p-8">
          <ErrorScreen
            title={errorTitle}
            message={errorMessage}
            errorType={errorType}
            documentationLink="https://wasilak.github.io/kube-ingress-dash/docs/architecture/rbac-setup"
            documentationText="View RBAC Setup Documentation"
            onRetry={() => {
              // Clear the error state to allow background processes to restart
              setError(null);
            }}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <ErrorBoundary>
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Image src="/images/logo.svg" alt="kube-ingress-dash logo" width={40} height={40} />
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
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <NamespaceFilter
                namespaces={allNamespaces}
                selected={selectedNamespaces}
                onChange={setSelectedNamespaces}
              />

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

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
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
            
            {/* Label and Annotation filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Labels
                </Label>
                <MultiSelect
                  options={labelOptions}
                  onValueChange={setSelectedLabels}
                  defaultValue={selectedLabels}
                  placeholder="Select labels..."
                  maxCount={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Annotations</Label>
                <MultiSelect
                  options={annotationOptions}
                  onValueChange={setSelectedAnnotations}
                  defaultValue={selectedAnnotations}
                  placeholder="Select annotations..."
                  maxCount={2}
                />
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
                <ErrorBoundary key={`${ingress.namespace}/${ingress.name}`} fallback={({ error }: { error: Error }) => (
                  <div className="p-4 bg-destructive/20 border border-destructive rounded-md">
                    <h3 className="font-medium text-destructive">Error rendering ingress card</h3>
                    {process.env.NODE_ENV === 'development' && error && (
                      <pre>{error.message}</pre>
                    )}
                  </div>
                )}>
                  <IngressCard 
                    key={`${ingress.namespace}/${ingress.name}`} 
                    ingress={ingress} 
                  />
                </ErrorBoundary>
              ))}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
