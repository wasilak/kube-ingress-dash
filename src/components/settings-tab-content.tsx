'use client';

import { useState, useEffect } from 'react';
import { Loader, Center } from '@mantine/core';
import { FilterInclusionSettings } from '@/components/filter-inclusion-settings';

interface SettingsTabContentProps {
  type: 'labels' | 'namespaces' | 'annotations';
}

export function SettingsTabContent({ type }: SettingsTabContentProps) {
  const [allItems, setAllItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/ingresses');
        if (!response.ok) throw new Error('Failed to fetch ingresses');

        const data = await response.json();
        const itemSet = new Set<string>();

        data.ingresses.forEach((ingress: any) => {
          if (type === 'namespaces') {
            if (ingress.namespace) {
              itemSet.add(ingress.namespace);
            }
          } else if (type === 'labels') {
            if (ingress.labels) {
              Object.keys(ingress.labels).forEach((label) => {
                itemSet.add(label);
              });
            }
          } else if (type === 'annotations') {
            if (ingress.annotations) {
              Object.keys(ingress.annotations).forEach((annotation) => {
                itemSet.add(annotation);
              });
            }
          }
        });

        setAllItems(Array.from(itemSet).sort());
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    );
  }

  return <FilterInclusionSettings type={type} allItems={allItems} />;
}
