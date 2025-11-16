'use client';

import { useState } from 'react';
import SearchBar from '@/components/search-bar';
import ErrorBoundary from '@/components/error-boundary';
import ErrorScreen from '@/components/error-screen';
import { IngressCardSkeletonGrid } from '@/components/skeletons';
import { useSearchSync } from '@/hooks/use-search-sync';
import { useNamespaces } from '@/hooks/use-namespaces';
import { useIngresses } from '@/hooks/use-ingresses';
import { useSSEStream } from '@/hooks/use-sse-stream';
import {
  DashboardHeader,
  DashboardStats,
  DashboardFilters,
  IngressList,
} from '@/components/dashboard';

export default function DashboardPage() {
  const [error, setError] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState<string[]>([]);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);

  // Search sync with URL
  const { searchQuery, debouncedSearchQuery, handleSearch, isMounted } = useSearchSync();

  // Ingresses data and filtering
  const { ingresses, filteredIngresses, loading, allLabels, allAnnotations, updateIngresses } =
    useIngresses({
      searchQuery: debouncedSearchQuery,
      selectedNamespaces,
      selectedLabels,
      selectedAnnotations,
      isMounted,
      error,
    });

  // Namespaces management
  const { namespaceCounts, namespacesWithIngresses } = useNamespaces({
    isMounted,
    error,
    ingresses,
  });

  // SSE stream for real-time updates
  useSSEStream({
    isMounted,
    selectedNamespaces,
    error,
    onIngressUpdate: updateIngresses,
    onError: setError,
  });

  // Calculate stats
  const totalIngresses = ingresses.length;
  const tlsIngresses = ingresses.filter((ingress) => ingress.tls).length;
  const nonTlsIngresses = totalIngresses - tlsIngresses;
  const filteredCount = filteredIngresses.length;

  // Loading skeleton
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-muted animate-pulse rounded" />
              <div className="h-8 bg-muted animate-pulse rounded w-64" />
            </div>
          </header>
          <IngressCardSkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    let errorType: 'permission' | 'api' | 'generic' = 'generic';
    let errorTitle = 'Error';
    let errorMessage = error;

    if (error.toLowerCase().includes('permission') || error.toLowerCase().includes('forbidden')) {
      errorType = 'permission';
      errorTitle = 'Permission Error';
      errorMessage =
        "You don't have sufficient permissions to access Kubernetes resources. Check your RBAC configuration.";
    } else if (error.toLowerCase().includes('api') || error.toLowerCase().includes('kubernetes')) {
      errorType = 'api';
      errorTitle = 'API Error';
      errorMessage =
        'There was an issue connecting to the Kubernetes API. Please check your cluster configuration.';
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
            onRetry={() => setError(null)}
          />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <ErrorBoundary>
        <div className="max-w-6xl mx-auto space-y-8">
          <DashboardHeader
            namespaces={namespacesWithIngresses}
            selectedNamespaces={selectedNamespaces}
            onNamespaceChange={setSelectedNamespaces}
            namespaceCounts={namespaceCounts}
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  onSearch={handleSearch}
                  value={searchQuery}
                  placeholder="Search ingresses by name, namespace, host, or path..."
                />
              </div>

              <DashboardStats
                totalIngresses={totalIngresses}
                tlsIngresses={tlsIngresses}
                nonTlsIngresses={nonTlsIngresses}
                filteredCount={filteredCount}
              />
            </div>

            <DashboardFilters
              allLabels={allLabels}
              allAnnotations={allAnnotations}
              selectedLabels={selectedLabels}
              selectedAnnotations={selectedAnnotations}
              onLabelsChange={setSelectedLabels}
              onAnnotationsChange={setSelectedAnnotations}
              ingresses={ingresses}
            />
          </div>

          {loading ? (
            <IngressCardSkeletonGrid count={6} />
          ) : (
            <IngressList
              ingresses={filteredIngresses}
              searchQuery={debouncedSearchQuery}
              onClearSearch={() => handleSearch('')}
            />
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}
