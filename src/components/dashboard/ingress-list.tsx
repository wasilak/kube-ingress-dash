import React from 'react';
import { IngressData } from '@/types/ingress';
import IngressCard from '@/components/ingress-card';
import ErrorBoundary from '@/components/error-boundary';
import { VirtualIngressGrid } from '@/components/virtual-ingress-grid';
import { Button } from '@/components/ui/button';

interface IngressListProps {
  ingresses: IngressData[];
  searchQuery: string;
  onClearSearch: () => void;
}

export const IngressList: React.FC<IngressListProps> = ({
  ingresses,
  searchQuery,
  onClearSearch,
}) => {
  if (ingresses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold">No ingresses found</h3>
        <p className="text-muted-foreground mt-1">
          {searchQuery
            ? `No ingresses match your search for "${searchQuery}"`
            : 'There are no ingresses in your cluster'}
        </p>
        {searchQuery && (
          <Button className="mt-4" onClick={onClearSearch}>
            Clear search
          </Button>
        )}
      </div>
    );
  }

  if (ingresses.length > 100) {
    return <VirtualIngressGrid ingresses={ingresses} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ingresses.map((ingress) => (
        <ErrorBoundary
          key={`${ingress.namespace}/${ingress.name}`}
          fallback={({ error }: { error: Error }) => (
            <div className="p-4 bg-destructive/20 border border-destructive rounded-md">
              <h3 className="font-medium text-destructive">Error rendering ingress card</h3>
              {process.env.NODE_ENV === 'development' && error && <pre>{error.message}</pre>}
            </div>
          )}
        >
          <IngressCard key={`${ingress.namespace}/${ingress.name}`} ingress={ingress} />
        </ErrorBoundary>
      ))}
    </div>
  );
};
