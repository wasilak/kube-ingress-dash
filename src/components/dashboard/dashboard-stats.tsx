import React from 'react';

interface DashboardStatsProps {
  totalIngresses: number;
  tlsIngresses: number;
  nonTlsIngresses: number;
  filteredCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalIngresses,
  tlsIngresses,
  nonTlsIngresses,
  filteredCount,
}) => {
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-primary"></div>
        <span>Ingresses: {totalIngresses}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <span>TLS: {tlsIngresses}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <span>Not TLS: {nonTlsIngresses}</span>
      </div>
      <div className="text-foreground/70">
        Showing: {filteredCount}/{totalIngresses}
      </div>
    </div>
  );
};
