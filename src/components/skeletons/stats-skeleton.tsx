import { Group } from '@mantine/core';

/**
 * Skeleton component for statistics display
 * Displays animated placeholders for ingress statistics
 */
export function StatsSkeleton() {
  return (
    <Group gap="md">
      <Group gap="xs">
        <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        <div className="h-4 bg-muted animate-pulse rounded w-24" />
      </Group>
      <Group gap="xs">
        <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        <div className="h-4 bg-muted animate-pulse rounded w-16" />
      </Group>
      <Group gap="xs">
        <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        <div className="h-4 bg-muted animate-pulse rounded w-20" />
      </Group>
      <div className="h-4 bg-muted animate-pulse rounded w-28" />
    </Group>
  );
}
