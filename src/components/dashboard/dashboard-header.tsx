import React from 'react';
import Image from 'next/image';
import { Group } from '@mantine/core';
import { ThemeToggle } from '@/components/theme-toggle';

export const DashboardHeader: React.FC = () => {
  return (
    <header>
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Group gap="sm">
          <Image src="/images/logo.svg" alt="Kube Ingress Dash logo" width={40} height={40} />
          <h1 className="text-3xl font-bold">Kube Ingress Dash</h1>
        </Group>

        <ThemeToggle />
      </Group>
    </header>
  );
};
