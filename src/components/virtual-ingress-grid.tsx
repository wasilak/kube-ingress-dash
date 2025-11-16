'use client';

import { useRef, useEffect, useState } from 'react';
import { Grid } from 'react-window';
import { IngressData } from '@/types/ingress';
import IngressCard from '@/components/ingress-card';
import ErrorBoundary from '@/components/error-boundary';

interface VirtualIngressGridProps {
  ingresses: IngressData[];
  columnCount?: number;
  itemHeight?: number;
  gap?: number;
}

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  ariaAttributes: Record<string, string>;
}

export function VirtualIngressGrid({
  ingresses,
  columnCount: propColumnCount,
  itemHeight = 280,
  gap = 24,
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

  const rowCount = Math.ceil(ingresses.length / columnCount);
  const columnWidth = (dimensions.width - gap * (columnCount - 1)) / columnCount;

  const CellComponent = ({ columnIndex, rowIndex, style }: CellProps) => {
    const index = rowIndex * columnCount + columnIndex;

    if (index >= ingresses.length) {
      return null;
    }

    const ingress = ingresses[index];

    const adjustedStyle = {
      ...style,
      left: typeof style.left === 'number' ? style.left + columnIndex * gap : style.left,
      top: typeof style.top === 'number' ? style.top + rowIndex * gap : style.top,
      width: typeof style.width === 'number' ? style.width - gap : style.width,
      height: typeof style.height === 'number' ? style.height - gap : style.height,
    };

    return (
      <div style={adjustedStyle}>
        <ErrorBoundary
          key={`${ingress.namespace}/${ingress.name}`}
          fallback={({ error }: { error: Error }) => (
            <div className="p-4 bg-destructive/20 border border-destructive rounded-md h-full">
              <h3 className="font-medium text-destructive">Error rendering ingress card</h3>
              {process.env.NODE_ENV === 'development' && error && (
                <pre className="text-xs mt-2 overflow-auto">{error.message}</pre>
              )}
            </div>
          )}
        >
          <IngressCard ingress={ingress} />
        </ErrorBoundary>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height: dimensions.height > 0 ? `${dimensions.height}px` : '600px' }}
    >
      {dimensions.width > 0 && (
        <Grid
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={itemHeight}
          cellComponent={CellComponent as any}
          cellProps={{} as any}
          overscanCount={2}
          className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900"
        />
      )}
    </div>
  );
}
