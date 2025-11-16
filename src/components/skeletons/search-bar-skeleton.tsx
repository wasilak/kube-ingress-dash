/**
 * Skeleton component for SearchBar loading state
 * Displays an animated placeholder while the search bar is initializing
 */
export function SearchBarSkeleton() {
  return (
    <div className="relative w-full">
      <div className="h-10 bg-muted animate-pulse rounded-md w-full" />
    </div>
  );
}
