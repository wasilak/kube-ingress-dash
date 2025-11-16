import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Skeleton component for IngressCard loading state
 * Displays an animated placeholder while ingress data is being fetched
 */
export function IngressCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          {/* Title skeleton */}
          <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
          {/* Namespace badge skeleton */}
          <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Hosts section skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
          <div className="space-y-1.5">
            <div className="h-3 bg-muted animate-pulse rounded w-full" />
            <div className="h-3 bg-muted animate-pulse rounded w-5/6" />
          </div>
        </div>
        
        {/* TLS badge skeleton */}
        <div className="h-5 bg-muted animate-pulse rounded w-16" />
        
        {/* Metadata section skeleton */}
        <div className="space-y-1.5 pt-2">
          <div className="h-3 bg-muted animate-pulse rounded w-full" />
          <div className="h-3 bg-muted animate-pulse rounded w-4/5" />
        </div>
      </CardContent>
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
