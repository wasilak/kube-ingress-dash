import React from 'react';
import { Group, Text } from '@mantine/core';

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
    <Group gap="md">
      <Group gap="xs">
        <div className="h-3 w-3 rounded-full bg-primary"></div>
        <Text size="sm">Ingresses: {totalIngresses}</Text>
      </Group>
      <Group gap="xs">
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <Text size="sm">TLS: {tlsIngresses}</Text>
      </Group>
      <Group gap="xs">
        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
        <Text size="sm">Not TLS: {nonTlsIngresses}</Text>
      </Group>
      <Text size="sm" c="dimmed">
        Showing: {filteredCount}/{totalIngresses}
      </Text>
    </Group>
  );
};
