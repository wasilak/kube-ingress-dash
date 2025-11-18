import React, { useMemo } from 'react';
import { MultiSelect, Grid, Group, Text, Stack, Select } from '@mantine/core';
import { IngressData } from '@/types/ingress';
import { Tag, FileText, FolderTree, Layers } from 'lucide-react';

import { GroupingMode } from '@/types/grouping';
import { useSettings } from '@/contexts/settings-context';

interface DashboardFiltersProps {
  allLabels: string[];
  allAnnotations: string[];
  selectedLabels: string[];
  selectedAnnotations: string[];
  onLabelsChange: (labels: string[]) => void;
  onAnnotationsChange: (annotations: string[]) => void;
  ingresses: IngressData[];
  groupingMode?: GroupingMode;
  onGroupingChange?: (mode: GroupingMode) => void;
  selectedNamespaces?: string[];
  onNamespacesChange?: (namespaces: string[]) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  allLabels,
  allAnnotations,
  selectedLabels,
  selectedAnnotations,
  onLabelsChange,
  onAnnotationsChange,
  ingresses,
  groupingMode,
  onGroupingChange,
  selectedNamespaces,
  onNamespacesChange,
}) => {
  const { settings } = useSettings();

  // Filter labels based on settings
  const filteredLabels = useMemo(() => {
    return allLabels.filter((label) => {
      const key = label.split(':')[0];
      return !settings.excludedLabels.includes(key);
    });
  }, [allLabels, settings.excludedLabels]);

  // Filter annotations based on settings
  const filteredAnnotations = useMemo(() => {
    return allAnnotations.filter((annotation) => {
      const key = annotation.split(':')[0];
      return !settings.excludedAnnotations.includes(key);
    });
  }, [allAnnotations, settings.excludedAnnotations]);

  // Group labels by key
  const labelOptions = useMemo(() => {
    const grouped = new Map<string, Map<string, { value: string; label: string; count: number }>>();

    filteredLabels.forEach((label) => {
      const colonIndex = label.indexOf(':');
      if (colonIndex === -1) return; // Skip malformed labels

      const key = label.substring(0, colonIndex);
      const value = label.substring(colonIndex + 1);

      const count = ingresses.filter((ing) => {
        if (!ing.labels) return false;
        return Object.keys(ing.labels).some((k) => `${k}:${ing.labels![k]}` === label);
      }).length;

      if (!grouped.has(key)) {
        grouped.set(key, new Map());
      }

      const keyGroup = grouped.get(key)!;
      // Deduplicate by value - if exists, sum the counts
      if (keyGroup.has(value)) {
        const existing = keyGroup.get(value)!;
        existing.count += count;
        existing.label = `${value} (${existing.count})`;
      } else {
        keyGroup.set(value, {
          value: label,
          label: `${value} (${count})`,
          count: count,
        });
      }
    });

    return Array.from(grouped.entries()).map(([key, itemsMap]) => ({
      group: key,
      items: Array.from(itemsMap.values()).map(({ value, label }) => ({ value, label })),
    }));
  }, [filteredLabels, ingresses]);

  // Group annotations by key
  const annotationOptions = useMemo(() => {
    const grouped = new Map<string, Map<string, { value: string; label: string; count: number }>>();

    filteredAnnotations.forEach((annotation) => {
      const colonIndex = annotation.indexOf(':');
      if (colonIndex === -1) return; // Skip malformed annotations

      const key = annotation.substring(0, colonIndex);
      const value = annotation.substring(colonIndex + 1);

      const count = ingresses.filter((ing) => {
        if (!ing.annotations) return false;
        return Object.keys(ing.annotations).some(
          (k) => `${k}:${ing.annotations![k]}` === annotation
        );
      }).length;

      if (!grouped.has(key)) {
        grouped.set(key, new Map());
      }

      const keyGroup = grouped.get(key)!;
      // Deduplicate by value - if exists, sum the counts
      if (keyGroup.has(value)) {
        const existing = keyGroup.get(value)!;
        existing.count += count;
        existing.label = `${value} (${existing.count})`;
      } else {
        keyGroup.set(value, {
          value: annotation,
          label: `${value} (${count})`,
          count: count,
        });
      }
    });

    return Array.from(grouped.entries()).map(([key, itemsMap]) => ({
      group: key,
      items: Array.from(itemsMap.values()).map(({ value, label }) => ({ value, label })),
    }));
  }, [filteredAnnotations, ingresses]);

  // Extract namespaces from ingresses (same source as labels/annotations)
  const namespaceOptions = useMemo(() => {
    const namespacesSet = new Set(ingresses.map((ing) => ing.namespace));
    const allNamespaces = Array.from(namespacesSet).sort();

    // Filter out excluded namespaces
    const namespaces = allNamespaces.filter((ns) => !settings.excludedNamespaces.includes(ns));

    const counts: Record<string, number> = {};
    ingresses.forEach((ing) => {
      counts[ing.namespace] = (counts[ing.namespace] || 0) + 1;
    });

    const totalCount = ingresses.length;

    return [
      { value: 'All', label: `All (${totalCount})` },
      ...namespaces.map((ns) => ({
        value: ns,
        label: `${ns} (${counts[ns]})`,
      })),
    ];
  }, [ingresses, settings.excludedNamespaces]);

  const groupingOptions = [
    { value: 'none', label: 'None' },
    { value: 'namespace', label: 'Namespace' },
    { value: 'tls', label: 'TLS Status' },
  ];

  const handleNamespaceChange = (values: string[]) => {
    if (!onNamespacesChange) return;

    if (values.includes('All')) {
      onNamespacesChange(['All']);
    } else {
      onNamespacesChange(values);
    }
  };

  return (
    <Grid gutter="md" pt="xs">
      {selectedNamespaces !== undefined && onNamespacesChange && (
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Stack gap="xs">
            <Group gap="xs">
              <Layers className="h-4 w-4" />
              <Text size="sm" fw={500}>
                Namespaces
              </Text>
            </Group>
            <MultiSelect
              data={namespaceOptions}
              value={selectedNamespaces}
              onChange={handleNamespaceChange}
              placeholder="Select namespaces"
              searchable
              clearable
              hidePickedOptions={false}
              styles={{
                root: {
                  width: '100%',
                },
                input: {
                  minHeight: 'auto',
                },
              }}
            />
          </Stack>
        </Grid.Col>
      )}

      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
        <Stack gap="xs">
          <Group gap="xs">
            <Tag className="h-4 w-4" />
            <Text size="sm" fw={500}>
              Labels
            </Text>
          </Group>
          <MultiSelect
            data={labelOptions}
            value={selectedLabels}
            onChange={onLabelsChange}
            placeholder="Select labels..."
            searchable
            clearable
            hidePickedOptions={false}
            styles={{
              root: {
                width: '100%',
              },
              input: {
                minHeight: 'auto',
              },
            }}
          />
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
        <Stack gap="xs">
          <Group gap="xs">
            <FileText className="h-4 w-4" />
            <Text size="sm" fw={500}>
              Annotations
            </Text>
          </Group>
          <MultiSelect
            data={annotationOptions}
            value={selectedAnnotations}
            onChange={onAnnotationsChange}
            placeholder="Select annotations..."
            searchable
            clearable
            hidePickedOptions={false}
            styles={{
              root: {
                width: '100%',
              },
              input: {
                minHeight: 'auto',
              },
            }}
          />
        </Stack>
      </Grid.Col>

      {groupingMode !== undefined && onGroupingChange && (
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Stack gap="xs">
            <Group gap="xs">
              <FolderTree className="h-4 w-4" />
              <Text size="sm" fw={500}>
                Group by
              </Text>
            </Group>
            <Select
              placeholder="Select grouping"
              data={groupingOptions}
              value={groupingMode}
              onChange={(val) => val && onGroupingChange(val as GroupingMode)}
              allowDeselect={false}
              styles={{
                root: {
                  minWidth: '180px',
                },
              }}
            />
          </Stack>
        </Grid.Col>
      )}
    </Grid>
  );
};
