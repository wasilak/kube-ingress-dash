/**
 * Skeleton component for filter controls (MultiSelect, NamespaceFilter)
 * Displays an animated placeholder while filter options are loading
 */
export function FilterSkeleton() {
  return (
    <div className="space-y-2">
      {/* Label skeleton */}
      <div className="h-4 bg-muted animate-pulse rounded w-20" />
      {/* Filter control skeleton */}
      <div className="h-10 bg-muted animate-pulse rounded-md w-full" />
    </div>
  );
}

/**
 * Skeleton for the filter section with multiple filters
 */
export function FiltersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
      <FilterSkeleton />
      <FilterSkeleton />
    </div>
  );
}
