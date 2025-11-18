'use client';

import { useState, useEffect } from 'react';
import { MultiSelect, Text, Stack, Badge, Loader, Center } from '@mantine/core';
import { useSettings } from '@/contexts/settings-context';

export function AnnotationExclusionSettings() {
  const { settings, updateSetting } = useSettings();
  const [allAnnotations, setAllAnnotations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch ingresses once to extract annotations
  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ingresses');
        if (!response.ok) throw new Error('Failed to fetch ingresses');

        const data = await response.json();
        const annotationSet = new Set<string>();

        data.ingresses.forEach((ingress: any) => {
          if (ingress.annotations) {
            Object.keys(ingress.annotations).forEach((annotation) => {
              annotationSet.add(annotation);
            });
          }
        });

        setAllAnnotations(Array.from(annotationSet).sort());
      } catch (error) {
        console.error('Error fetching annotations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnotations();
  }, []);

  const handleChange = (values: string[]) => {
    updateSetting('excludedAnnotations', values);
  };

  const includedCount = allAnnotations.length - settings.excludedAnnotations.length;

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
          Select annotations to exclude from filter options. Excluded annotations will not appear in
          the dashboard filters.
        </Text>
        <Badge color="blue" variant="light">
          {includedCount} of {allAnnotations.length} annotations included
        </Badge>
      </div>

      <MultiSelect
        label="Excluded Annotations"
        placeholder="Select annotations to exclude"
        data={allAnnotations}
        value={settings.excludedAnnotations}
        onChange={handleChange}
        searchable
        clearable
        maxDropdownHeight={300}
        description="Annotations selected here will be hidden from the dashboard filter options"
      />
    </Stack>
  );
}
