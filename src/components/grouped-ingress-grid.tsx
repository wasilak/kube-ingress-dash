import React from 'react';
import { IngressGroup } from '@/types/grouping';
import IngressCard from '@/components/ingress-card';
import ErrorBoundary from '@/components/error-boundary';
import { VirtualIngressGrid } from '@/components/virtual-ingress-grid';
import { Title, Text } from '@mantine/core';

interface GroupedIngressGridProps {
  groups: IngressGroup[];
  searchQuery?: string;
}

export const GroupedIngressGrid: React.FC<GroupedIngressGridProps> = ({ groups, searchQuery }) => {
  // If there's only one group with key 'all', render without grouping
  if (groups.length === 1 && groups[0].key === 'all') {
    const ingresses = groups[0].ingresses;

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
            <IngressCard ingress={ingress} />
          </ErrorBoundary>
        ))}
      </div>
    );
  }

  // Render grouped sections
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.key} className="space-y-4">
          <div className="flex items-baseline gap-2">
            <Title order={3} size="h4">
              {group.label}
            </Title>
            <Text size="sm" c="dimmed">
              ({group.count})
            </Text>
          </div>

          {group.count === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed rounded-lg">
              <Text c="dimmed">
                No ingresses in this group
                {searchQuery && ` matching "${searchQuery}"`}
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.ingresses.map((ingress) => (
                <ErrorBoundary
                  key={`${ingress.namespace}/${ingress.name}`}
                  fallback={({ error }: { error: Error }) => (
                    <div className="p-4 bg-destructive/20 border border-destructive rounded-md">
                      <h3 className="font-medium text-destructive">Error rendering ingress card</h3>
                      {process.env.NODE_ENV === 'development' && error && (
                        <pre>{error.message}</pre>
                      )}
                    </div>
                  )}
                >
                  <IngressCard ingress={ingress} />
                </ErrorBoundary>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
