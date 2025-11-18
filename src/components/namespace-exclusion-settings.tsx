'use client';

import { useState, useEffect } from 'react';
import { MultiSelect, Text, Stack, Badge, Loader, Center } from '@mantine/core';
import { useSettings } from '@/contexts/settings-context';

export function NamespaceExclusionSettings() {
  const { settings, updateSetting } = useSettings();
  const [allNamespaces, setAllNamespaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ingresses once to extract namespaces
  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ingresses');
        if (!response.ok) throw new Error('Failed to fetch ingresses');

        const data = await response.json();
        const namespaceSet = new Set<string>();

        data.ingresses.forEach((ingress: any) => {
          if (ingress.namespace) {
            namespaceSet.add(ingress.namespace);
          }
        });

        setAllNamespaces(Array.from(namespaceSet).sort());
      } catch (error) {
        console.error('Error fetching namespaces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNamespaces();
  }, []);

  const handleChange = (values: string[]) => {
    updateSetting('excludedNamespaces', values);
  };

  const includedCount = allNamespaces.length - settings.excludedNamespaces.length;

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
          Select namespaces to exclude from filter options. Excluded namespaces will not appear in
          the dashboard filters.
        </Text>
        <Badge color="blue" variant="light">
          {includedCount} of {allNamespaces.length} namespaces included
        </Badge>
      </div>

      <MultiSelect
        label="Excluded Namespaces"
        placeholder="Select namespaces to exclude"
        data={allNamespaces}
        value={settings.excludedNamespaces}
        onChange={handleChange}
        searchable
        clearable
        maxDropdownHeight={300}
        description="Namespaces selected here will be hidden from the dashboard filter options"
      />
    </Stack>
  );
}
