import React, { useState, useMemo, useCallback, memo } from 'react';
import { IngressGroup } from '@/types/grouping';
import { IngressData } from '@/types/ingress';
import IngressCard from '@/components/ingress-card';
import ErrorBoundary from '@/components/error-boundary';
import { VirtualIngressGrid } from '@/components/virtual-ingress-grid';
import { Title, Text, Collapse, ActionIcon, Group } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface GroupedIngressGridProps {
  groups: IngressGroup[];
  searchQuery?: string;
  onDetailsClick?: (ingress: IngressData) => void;
}

const GroupedIngressGridComponent: React.FC<GroupedIngressGridProps> = ({
  groups,
  searchQuery,
  onDetailsClick,
}) => {
  // State to track which groups are expanded (all expanded by default)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((group) => {
      initial[group.key] = true;
    });
    return initial;
  });

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  // Check if we have a single 'all' group
  const isSingleAllGroup = groups.length === 1 && groups[0].key === 'all';
  const singleGroupIngresses = isSingleAllGroup ? groups[0].ingresses : [];

  // Memoize group sections to prevent unnecessary re-renders
  const groupSections = useMemo(() => {
    if (isSingleAllGroup) {
      return null; // Will be handled separately
    }
    return groups.map((group) => {
      const isExpanded = expandedGroups[group.key] ?? true;

      return (
        <div key={group.key} className="space-y-4">
          <Group gap="sm" style={{ cursor: 'pointer' }} onClick={() => toggleGroup(group.key)}>
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label={isExpanded ? 'Collapse group' : 'Expand group'}
            >
              {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
            </ActionIcon>
            <Title order={3} size="h4">
              {group.label}
            </Title>
            <Text size="sm" c="dimmed">
              ({group.count})
            </Text>
          </Group>

          <Collapse in={isExpanded}>
            {group.count === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed rounded-lg">
                <Text c="dimmed">
                  No ingresses in this group
                  {searchQuery && ` matching "${searchQuery}"`}
                </Text>
              </div>
            ) : group.ingresses.length > 100 ? (
              // Use virtualization for large groups
              <VirtualIngressGrid ingresses={group.ingresses} onDetailsClick={onDetailsClick} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.ingresses.map((ingress) => (
                  <ErrorBoundary
                    key={`${ingress.namespace}/${ingress.name}`}
                    fallback={({ error }: { error: Error }) => (
                      <div className="p-4 bg-destructive/20 border border-destructive rounded-md">
                        <h3 className="font-medium text-destructive">
                          Error rendering ingress card
                        </h3>
                        {process.env.NODE_ENV === 'development' && error && (
                          <pre>{error.message}</pre>
                        )}
                      </div>
                    )}
                  >
                    <IngressCard
                      ingress={ingress}
                      onDetailsClick={onDetailsClick ? () => onDetailsClick(ingress) : undefined}
                    />
                  </ErrorBoundary>
                ))}
              </div>
            )}
          </Collapse>
        </div>
      );
    });
  }, [groups, expandedGroups, searchQuery, onDetailsClick, toggleGroup, isSingleAllGroup]);

  // If there's only one group with key 'all', render without grouping
  if (isSingleAllGroup) {
    if (singleGroupIngresses.length > 100) {
      return (
        <VirtualIngressGrid ingresses={singleGroupIngresses} onDetailsClick={onDetailsClick} />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {singleGroupIngresses.map((ingress) => (
          <ErrorBoundary
            key={`${ingress.namespace}/${ingress.name}`}
            fallback={({ error }: { error: Error }) => (
              <div className="p-4 bg-destructive/20 border border-destructive rounded-md">
                <h3 className="font-medium text-destructive">Error rendering ingress card</h3>
                {process.env.NODE_ENV === 'development' && error && <pre>{error.message}</pre>}
              </div>
            )}
          >
            <IngressCard
              ingress={ingress}
              onDetailsClick={onDetailsClick ? () => onDetailsClick(ingress) : undefined}
            />
          </ErrorBoundary>
        ))}
      </div>
    );
  }

  // Render grouped sections with collapsible functionality
  return <div className="space-y-8">{groupSections}</div>;
};

// Memoize the entire component to prevent unnecessary re-renders
export const GroupedIngressGrid = memo(GroupedIngressGridComponent, (prevProps, nextProps) => {
  // Compare groups array length and keys
  if (prevProps.groups.length !== nextProps.groups.length) {
    return false; // Props changed, re-render
  }

  // Check if group keys or counts changed
  const groupsChanged = prevProps.groups.some((prevGroup, index) => {
    const nextGroup = nextProps.groups[index];
    return (
      prevGroup.key !== nextGroup.key ||
      prevGroup.count !== nextGroup.count ||
      prevGroup.ingresses.length !== nextGroup.ingresses.length
    );
  });

  // Compare other props
  const searchQueryChanged = prevProps.searchQuery !== nextProps.searchQuery;
  const onDetailsClickChanged = prevProps.onDetailsClick !== nextProps.onDetailsClick;

  // Return true if nothing changed (skip re-render), false if something changed (re-render)
  return !groupsChanged && !searchQueryChanged && !onDetailsClickChanged;
});
