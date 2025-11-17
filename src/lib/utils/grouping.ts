import { IngressData } from '@/types/ingress';
import { GroupingMode, IngressGroup } from '@/types/grouping';

/**
 * Groups ingresses based on the specified grouping mode
 * @param ingresses - Array of ingress data to group
 * @param mode - The grouping mode to apply
 * @returns Array of ingress groups with labels and counts
 */
export function groupIngresses(ingresses: IngressData[], mode: GroupingMode): IngressGroup[] {
  if (mode === 'none') {
    return [
      {
        key: 'all',
        label: 'All Ingresses',
        count: ingresses.length,
        ingresses,
      },
    ];
  }

  if (mode === 'namespace') {
    return groupByNamespace(ingresses);
  }

  if (mode === 'tls') {
    return groupByTLSStatus(ingresses);
  }

  // Fallback to no grouping
  return [
    {
      key: 'all',
      label: 'All Ingresses',
      count: ingresses.length,
      ingresses,
    },
  ];
}

/**
 * Groups ingresses by namespace
 * @param ingresses - Array of ingress data
 * @returns Array of groups organized by namespace
 */
function groupByNamespace(ingresses: IngressData[]): IngressGroup[] {
  // Extract all unique namespaces
  const namespaces = Array.from(new Set(ingresses.map((ing) => ing.namespace))).sort();

  // Create a group for each namespace
  const groups: IngressGroup[] = namespaces.map((namespace) => {
    const namespacedIngresses = ingresses.filter((ing) => ing.namespace === namespace);
    return {
      key: namespace,
      label: namespace,
      count: namespacedIngresses.length,
      ingresses: namespacedIngresses,
    };
  });

  return groups;
}

/**
 * Groups ingresses by TLS status
 * @param ingresses - Array of ingress data
 * @returns Array of groups organized by TLS enabled/disabled
 */
function groupByTLSStatus(ingresses: IngressData[]): IngressGroup[] {
  const tlsEnabled = ingresses.filter((ing) => ing.tls);
  const tlsDisabled = ingresses.filter((ing) => !ing.tls);

  return [
    {
      key: 'tls-enabled',
      label: 'TLS Enabled',
      count: tlsEnabled.length,
      ingresses: tlsEnabled,
    },
    {
      key: 'tls-disabled',
      label: 'TLS Disabled',
      count: tlsDisabled.length,
      ingresses: tlsDisabled,
    },
  ];
}
