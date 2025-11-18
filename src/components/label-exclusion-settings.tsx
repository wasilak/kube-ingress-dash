'use client';

import { useState, useEffect } from 'react';
import { MultiSelect, Text, Stack, Badge, Loader, Center } from '@mantine/core';
import { useSettings } from '@/contexts/settings-context';

export function LabelExclusionSettings() {
  const { settings, updateSetting } = useSettings();
  const [allLabels, setAllLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ingresses once to extract labels
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ingresses');
        if (!response.ok) throw new Error('Failed to fetch ingresses');

        const data = await response.json();
        const labelSet = new Set<string>();

        data.ingresses.forEach((ingress: any) => {
          if (ingress.labels) {
            Object.keys(ingress.labels).forEach((label) => {
              labelSet.add(label);
            });
          }
        });

        setAllLabels(Array.from(labelSet).sort());
      } catch (error) {
        console.error('Error fetching labels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, []);

  const handleChange = (values: string[]) => {
    updateSetting('excludedLabels', values);
  };

  const includedCount = allLabels.length - settings.excludedLabels.length;

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    );
  }

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" c="dimmed" mb="xs">
          Select labels to exclude from filter options. Excluded labels will not appear in the
          dashboard filters.
        </Text>
        <Badge color="blue" variant="light">
          {includedCount} of {allLabels.length} labels included
        </Badge>
      </div>

      <MultiSelect
        label="Excluded Labels"
        placeholder="Select labels to exclude"
        data={allLabels}
        value={settings.excludedLabels}
        onChange={handleChange}
        searchable
        clearable
        maxDropdownHeight={300}
        description="Labels selected here will be hidden from the dashboard filter options"
      />
    </Stack>
  );
}
