'use client';

import { useMemo } from 'react';
import { MultiSelect, Text, Stack, Badge, useMantineColorScheme } from '@mantine/core';
import { useSettings } from '@/contexts/settings-context';
import type { FilterSettings } from '@/lib/settings-storage';

interface FilterInclusionSettingsProps {
  type: 'labels' | 'namespaces' | 'annotations';
  allItems: string[];
  loading?: boolean;
}

const CONFIG = {
  labels: {
    title: 'Included Labels',
    description:
      'Select which labels should appear in the dashboard filters. Deselect labels you want to hide.',
    placeholder: 'Select labels to include',
    helpText: 'Only selected labels will appear in the dashboard filter options',
    settingsKey: 'excludedLabels' as keyof FilterSettings,
  },
  namespaces: {
    title: 'Included Namespaces',
    description:
      'Select which namespaces should appear in the dashboard filters. Deselect namespaces you want to hide.',
    placeholder: 'Select namespaces to include',
    helpText: 'Only selected namespaces will appear in the dashboard filter options',
    settingsKey: 'excludedNamespaces' as keyof FilterSettings,
  },
  annotations: {
    title: 'Included Annotations',
    description:
      'Select which annotations should appear in the dashboard filters. Deselect annotations you want to hide.',
    placeholder: 'Select annotations to include',
    helpText: 'Only selected annotations will appear in the dashboard filter options',
    settingsKey: 'excludedAnnotations' as keyof FilterSettings,
  },
};

export function FilterInclusionSettings({ type, allItems }: FilterInclusionSettingsProps) {
  const { settings, updateSetting } = useSettings();
  const { colorScheme } = useMantineColorScheme();
  const config = CONFIG[type];

  // Calculate included items (all items minus excluded ones)
  const includedItems = useMemo(() => {
    const excluded = settings[config.settingsKey] as string[];
    return allItems.filter((item) => !excluded.includes(item));
  }, [allItems, settings, config.settingsKey]);

  const handleChange = (values: string[]) => {
    // Convert included list to excluded list
    const excluded = allItems.filter((item) => !values.includes(item));
    updateSetting(config.settingsKey, excluded);
  };

  const isDark = colorScheme === 'dark';

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" c="dimmed" mb="xs">
          {config.description}
        </Text>
        <Badge color="indigo" variant="light">
          {includedItems.length} of {allItems.length} {type} included
        </Badge>
      </div>

      <MultiSelect
        label={config.title}
        placeholder={config.placeholder}
        data={allItems}
        value={includedItems}
        onChange={handleChange}
        searchable
        clearable
        maxDropdownHeight={300}
        description={config.helpText}
        styles={{
          pill: {
            backgroundColor: isDark
              ? 'var(--mantine-color-indigo-9)'
              : 'var(--mantine-color-indigo-1)',
            color: isDark ? 'var(--mantine-color-indigo-2)' : 'var(--mantine-color-indigo-9)',
            border: '1px solid var(--mantine-color-indigo-6)',
          },
        }}
      />
    </Stack>
  );
}
