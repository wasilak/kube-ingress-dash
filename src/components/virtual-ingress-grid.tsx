'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { IngressData } from '@/types/ingress';
import IngressCard from '@/components/ingress-card';
import ErrorBoundary from '@/components/error-boundary';

interface VirtualIngressGridProps {
  ingresses: IngressData[];
  columnCount?: number;
  itemHeight?: number;
  gap?: number;
  onDetailsClick?: (ingress: IngressData) => void;
}

export function VirtualIngressGrid({
  ingresses,
  columnCount: propColumnCount,
  itemHeight = 280,
  gap = 24,
  onDetailsClick,
}: VirtualIngressGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [columnCount, setColumnCount] = useState(propColumnCount || 3);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      const height = Math.max(600, window.innerHeight - containerRef.current.offsetTop - 100);

      setDimensions({ width, height });

      if (!propColumnCount) {
        if (width >= 1024) {
          setColumnCount(3);
        } else if (width >= 768) {
          setColumnCount(2);
        } else {
          setColumnCount(1);
        }
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [propColumnCount]);

  // Calculate rows based on column count
  const rows = useMemo(() => {
    const result: IngressData[][] = [];
    for (let i = 0; i < ingresses.length; i += columnCount) {
      result.push(ingresses.slice(i, i + columnCount));
    }
    return result;
  }, [ingresses, columnCount]);

  // Create virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 2,
  });

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900"
      style={{ height: dimensions.height > 0 ? `${dimensions.height}px` : '600px' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${itemHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                }}
              >
                {row.map((ingress) => (
                  <ErrorBoundary
                    key={`${ingress.namespace}/${ingress.name}`}
                    fallback={({ error }: { error: Error }) => (
                      <div className="p-4 bg-destructive/20 border border-destructive rounded-md h-full">
                        <h3 className="font-medium text-destructive">
                          Error rendering ingress card
                        </h3>
                        {process.env.NODE_ENV === 'development' && error && (
                          <pre className="text-xs mt-2 overflow-auto">{error.message}</pre>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
