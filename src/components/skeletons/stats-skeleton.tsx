/**
 * Skeleton component for statistics display
 * Displays animated placeholders for ingress statistics
 */
export function StatsSkeleton() {
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        <div className="h-4 bg-muted animate-pulse rounded w-24" />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        <div className="h-4 bg-muted animate-pulse rounded w-16" />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        <div className="h-4 bg-muted animate-pulse rounded w-20" />
      </div>
      <div className="h-4 bg-muted animate-pulse rounded w-28" />
    </div>
  );
}
