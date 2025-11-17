'use client';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/search-bar';
import ErrorBoundary from '@/components/error-boundary';
import ErrorScreen from '@/components/error-screen';
import { IngressCardSkeletonGrid } from '@/components/skeletons';
import { useSearchSync } from '@/hooks/use-search-sync';
import { useNamespaces } from '@/hooks/use-namespaces';
import { useIngresses } from '@/hooks/use-ingresses';
import { useSSEStream } from '@/hooks/use-sse-stream';
import { DashboardHeader, DashboardStats, DashboardFilters } from '@/components/dashboard';
import {
  DashboardErrorBoundary,
  IngressListErrorBoundary,
  FiltersErrorBoundary,
} from '@/components/error-boundaries';
import { GroupingSelector } from '@/components/grouping-selector';
import { GroupedIngressGrid } from '@/components/grouped-ingress-grid';
import { GroupingMode } from '@/types/grouping';
import { groupIngresses } from '@/lib/utils/grouping';
import { IngressDetailsModal } from '@/components/ingress-details-modal';
import { notifications } from '@mantine/notifications';
import { IngressData } from '@/types/ingress';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState<string[]>([]);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [selectedIngress, setSelectedIngress] = useState<IngressData | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  // Initialize grouping mode from URL or default to 'none'
  const [groupingMode, setGroupingMode] = useState<GroupingMode>(() => {
    const groupParam = searchParams.get('group');
    if (groupParam === 'namespace' || groupParam === 'tls') {
      return groupParam;
    }
    return 'none';
  });

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

  // Parse ingress parameter from URL and validate format
  const parseIngressFromUrl = useCallback(
    (ingressParam: string | null): { namespace: string; name: string } | null => {
      if (!ingressParam) return null;

      // Expected format: namespace/name
      const parts = ingressParam.split('/');
      if (parts.length !== 2) {
        return null;
      }

      const [namespace, name] = parts;
      if (!namespace || !name) {
        return null;
      }

      return { namespace, name };
    },
    []
  );

  // Find ingress in data by namespace and name
  const findIngressByIdentifier = useCallback(
    (namespace: string, name: string): IngressData | null => {
      return ingresses.find((ing) => ing.namespace === namespace && ing.name === name) || null;
    },
    [ingresses]
  );

  // Update URL when grouping mode changes
  useEffect(() => {
    if (!isMounted) return;

    const params = new URLSearchParams(window.location.search);

    if (groupingMode === 'none') {
      params.delete('group');
    } else {
      params.set('group', groupingMode);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newUrl, { scroll: false });
  }, [groupingMode, isMounted, router]);

  // Handle URL parameter for opening modal (Sub-task 10.1)
  useEffect(() => {
    if (!isMounted || loading) return;

    const ingressParam = searchParams.get('ingress');

    if (ingressParam) {
      const parsed = parseIngressFromUrl(ingressParam);

      if (!parsed) {
        // Invalid format
        notifications.show({
          title: 'Invalid URL',
          message: 'The ingress identifier format is invalid. Expected format: namespace/name',
          color: 'red',
        });

        // Clean up URL
        const params = new URLSearchParams(window.location.search);
        params.delete('ingress');
        const newUrl = params.toString() ? `?${params.toString()}` : '/';
        router.replace(newUrl, { scroll: false });
        return;
      }

      const foundIngress = findIngressByIdentifier(parsed.namespace, parsed.name);

      if (!foundIngress) {
        // Ingress not found
        notifications.show({
          title: 'Ingress Not Found',
          message: `Could not find ingress "${parsed.name}" in namespace "${parsed.namespace}"`,
          color: 'red',
        });

        // Clean up URL
        const params = new URLSearchParams(window.location.search);
        params.delete('ingress');
        const newUrl = params.toString() ? `?${params.toString()}` : '/';
        router.replace(newUrl, { scroll: false });
        return;
      }

      // Open modal with found ingress
      setSelectedIngress(foundIngress);
      setModalOpened(true);
    }
  }, [
    searchParams,
    isMounted,
    loading,
    ingresses,
    router,
    parseIngressFromUrl,
    findIngressByIdentifier,
  ]);

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

  // Group ingresses based on selected mode
  const groupedIngresses = useMemo(
    () => groupIngresses(filteredIngresses, groupingMode),
    [filteredIngresses, groupingMode]
  );

  // Handle opening modal and updating URL (Sub-task 10.2)
  const handleDetailsClick = useCallback(
    (ingress: IngressData) => {
      setSelectedIngress(ingress);
      setModalOpened(true);

      // Update URL with ingress identifier
      const params = new URLSearchParams(window.location.search);
      params.set('ingress', `${ingress.namespace}/${ingress.name}`);
      const newUrl = `?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [router]
  );

  // Handle closing modal and cleaning URL (Sub-task 10.3)
  const handleModalClose = useCallback(() => {
    setModalOpened(false);
    setSelectedIngress(null);

    // Remove ingress parameter from URL
    const params = new URLSearchParams(window.location.search);
    params.delete('ingress');
    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newUrl, { scroll: false });
  }, [router]);

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
      <DashboardErrorBoundary>
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

            <div className="flex flex-col sm:flex-row gap-4">
              <FiltersErrorBoundary>
                <DashboardFilters
                  allLabels={allLabels}
                  allAnnotations={allAnnotations}
                  selectedLabels={selectedLabels}
                  selectedAnnotations={selectedAnnotations}
                  onLabelsChange={setSelectedLabels}
                  onAnnotationsChange={setSelectedAnnotations}
                  ingresses={ingresses}
                />
              </FiltersErrorBoundary>

              <div className="sm:ml-auto">
                <GroupingSelector value={groupingMode} onChange={setGroupingMode} />
              </div>
            </div>
          </div>

          {loading ? (
            <IngressCardSkeletonGrid count={6} />
          ) : filteredIngresses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-bold">No ingresses found</h3>
              <p className="text-muted-foreground mt-1">
                {debouncedSearchQuery
                  ? `No ingresses match your search for "${debouncedSearchQuery}"`
                  : 'There are no ingresses in your cluster'}
              </p>
            </div>
          ) : (
            <IngressListErrorBoundary>
              <GroupedIngressGrid
                groups={groupedIngresses}
                searchQuery={debouncedSearchQuery}
                onDetailsClick={handleDetailsClick}
              />
            </IngressListErrorBoundary>
          )}
        </div>
      </DashboardErrorBoundary>

      {/* Ingress Details Modal */}
      <IngressDetailsModal
        opened={modalOpened}
        onClose={handleModalClose}
        ingress={selectedIngress}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
