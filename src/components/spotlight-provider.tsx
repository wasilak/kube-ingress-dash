'use client';

import { Spotlight, SpotlightActionData, SpotlightActionGroupData } from '@mantine/spotlight';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  IconHome,
  IconSettings,
  IconTag,
  IconServer,
  IconNote,
  IconSearch,
  IconLock,
  IconLockOpen,
  IconExternalLink,
} from '@tabler/icons-react';
import { useSpotlightIngresses } from '@/contexts/spotlight-context';

export function SpotlightProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ingresses } = useSpotlightIngresses();

  // Combine all actions with groups
  const allActions: (SpotlightActionGroupData | SpotlightActionData)[] = useMemo(() => {
    const navigationGroup: SpotlightActionGroupData = {
      group: 'Navigation',
      actions: [
        {
          id: 'dashboard',
          label: 'Go to Dashboard',
          description: 'Navigate to the main dashboard',
          onClick: () => router.push('/'),
          leftSection: <IconHome size={20} />,
        },
        {
          id: 'settings',
          label: 'Go to Settings',
          description: 'Navigate to settings overview',
          onClick: () => router.push('/settings'),
          leftSection: <IconSettings size={20} />,
        },
        {
          id: 'settings-namespaces',
          label: 'Settings - Namespaces',
          description: 'Configure namespace filter exclusions',
          onClick: () => router.push('/settings/namespaces'),
          leftSection: <IconServer size={20} />,
        },
        {
          id: 'settings-labels',
          label: 'Settings - Labels',
          description: 'Configure label filter exclusions',
          onClick: () => router.push('/settings/labels'),
          leftSection: <IconTag size={20} />,
        },
        {
          id: 'settings-annotations',
          label: 'Settings - Annotations',
          description: 'Configure annotation filter exclusions',
          onClick: () => router.push('/settings/annotations'),
          leftSection: <IconNote size={20} />,
        },
      ],
    };

    const ingressGroup: SpotlightActionGroupData = {
      group: 'Ingresses',
      actions: ingresses.map((ingress) => ({
        id: `ingress-${ingress.namespace}-${ingress.name}`,
        label: ingress.name,
        description: `${ingress.namespace} • ${ingress.hosts?.[0] || 'No host'}`,
        onClick: () => {
          const params = new URLSearchParams(window.location.search);
          params.set('ingress', `${ingress.namespace}/${ingress.name}`);
          router.push(`/?${params.toString()}`);
        },
        leftSection: ingress.tls ? <IconLock size={20} /> : <IconLockOpen size={20} />,
      })),
    };

    // Extract unique host URLs from filtered ingresses
    const hostUrls = new Set<string>();
    ingresses.forEach((ingress) => {
      if (ingress.hosts && ingress.hosts.length > 0) {
        ingress.hosts.forEach((host) => {
          const protocol = ingress.tls ? 'https' : 'http';
          hostUrls.add(`${protocol}://${host}`);
        });
      }
    });

    const hostsGroup: SpotlightActionGroupData = {
      group: 'Host URLs',
      actions: Array.from(hostUrls)
        .sort()
        .map((url) => ({
          id: `host-${url}`,
          label: url,
          description: 'Open in new tab',
          onClick: () => {
            window.open(url, '_blank', 'noopener,noreferrer');
          },
          leftSection: <IconExternalLink size={20} />,
        })),
    };

    const groups = [navigationGroup];
    if (ingresses.length > 0) {
      groups.push(ingressGroup);
    }
    if (hostUrls.size > 0) {
      groups.push(hostsGroup);
    }

    return groups;
  }, [ingresses, router]);

  return (
    <>
      <Spotlight
        actions={allActions}
        nothingFound="No results found"
        highlightQuery
        searchProps={{
          leftSection: <IconSearch size={20} />,
          placeholder: 'Search navigation and ingresses...',
        }}
        shortcut={['mod + K']}
        scrollable
        maxHeight={400}
      />
      {children}
    </>
  );
}
