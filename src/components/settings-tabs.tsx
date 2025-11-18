'use client';

import { Tabs } from '@mantine/core';
import { IconTag, IconFolder, IconNote } from '@tabler/icons-react';

interface SettingsTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

export function SettingsTabs({ children, defaultValue = 'labels' }: SettingsTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} variant="outline">
      <Tabs.List>
        <Tabs.Tab value="labels" leftSection={<IconTag size={16} />}>
          Labels
        </Tabs.Tab>
        <Tabs.Tab value="namespaces" leftSection={<IconFolder size={16} />}>
          Namespaces
        </Tabs.Tab>
        <Tabs.Tab value="annotations" leftSection={<IconNote size={16} />}>
          Annotations
        </Tabs.Tab>
      </Tabs.List>

      {children}
    </Tabs>
  );
}
