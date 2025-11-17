import { Card, Skeleton } from '@mantine/core';

/**
 * Skeleton component for IngressCard loading state
 * Displays an animated placeholder while ingress data is being fetched
 */
export function IngressCardSkeleton() {
  return (
    <Card className="overflow-hidden" padding="md" radius="md" withBorder>
      <div className="pb-3">
        <div className="space-y-2">
          {/* Title skeleton */}
          <Skeleton height={20} width="75%" />
          {/* Namespace badge skeleton */}
          <Skeleton height={16} width="33%" />
        </div>
      </div>
      <div className="space-y-3">
        {/* Hosts section skeleton */}
        <div className="space-y-2">
          <Skeleton height={16} width="25%" />
          <div className="space-y-1.5">
            <Skeleton height={12} width="100%" />
            <Skeleton height={12} width="83%" />
          </div>
        </div>

        {/* TLS badge skeleton */}
        <Skeleton height={20} width={64} />

        {/* Metadata section skeleton */}
        <div className="space-y-1.5 pt-2">
          <Skeleton height={12} width="100%" />
          <Skeleton height={12} width="80%" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Grid of skeleton cards for loading multiple ingresses
 */
export function IngressCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <IngressCardSkeleton key={index} />
      ))}
    </div>
  );
}
