import React from 'react';
import Image from 'next/image';
import { NamespaceFilter } from '@/components/ui/namespace-filter';
import { ThemeToggle } from '@/components/theme-toggle';

interface DashboardHeaderProps {
  namespaces: string[];
  selectedNamespaces: string[];
  onNamespaceChange: (namespaces: string[]) => void;
  namespaceCounts: Record<string, number>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  namespaces,
  selectedNamespaces,
  onNamespaceChange,
  namespaceCounts,
}) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Image src="/images/logo.svg" alt="kube-ingress-dash logo" width={40} height={40} />
        <h1 className="text-3xl font-bold">kube-ingress-dash</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <NamespaceFilter
          namespaces={namespaces}
          selected={selectedNamespaces}
          onChange={onNamespaceChange}
          namespaceCounts={namespaceCounts}
        />
        <ThemeToggle />
      </div>
    </header>
  );
};
