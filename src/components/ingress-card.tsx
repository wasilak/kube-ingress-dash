'use client';

import React, { memo } from 'react';
import { Button, Badge, Card, Text, Stack, Group, ActionIcon } from '@mantine/core';
import { IconExternalLink, IconLock, IconFolder, IconInfoCircle } from '@tabler/icons-react';
import { IngressData } from '@/types/ingress';

interface IngressCardProps {
  ingress: IngressData;
  onClick?: () => void;
  onDetailsClick?: () => void;
}

const IngressCardComponent: React.FC<IngressCardProps> = ({
  ingress,
  onClick: _onClick,
  onDetailsClick,
}) => {
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card
      className="flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-primary border bg-transparent"
      padding="md"
      radius="md"
      withBorder
    >
      <Stack gap="md" style={{ height: '100%' }}>
        {/* Header Section */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs" wrap="nowrap" align="flex-start">
              <Text
                className="text-base leading-tight break-words hyphens-auto flex-1 min-w-0 font-semibold"
                style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
              >
                {ingress.name}
              </Text>
              {ingress.tls && (
                <IconLock
                  size={16}
                  className="text-primary flex-shrink-0"
                  style={{ marginTop: '2px' }}
                />
              )}
            </Group>
            <Group gap={4} wrap="nowrap">
              <IconFolder size={12} className="flex-shrink-0" style={{ opacity: 0.6 }} />
              <Text size="xs" c="dimmed" className="leading-tight break-words">
                {ingress.namespace}
              </Text>
            </Group>
          </Stack>
          {onDetailsClick && (
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={onDetailsClick}
              aria-label={`View details for ${ingress.name}`}
              className="flex-shrink-0"
            >
              <IconInfoCircle size={20} />
            </ActionIcon>
          )}
        </Group>

        {/* Content Section */}
        <Stack gap="md" style={{ flex: 1 }}>
          {/* Hosts - now as clickable buttons */}
          {ingress.hosts.length > 0 && (
            <Stack gap="xs">
              <Text size="xs" fw={500}>
                Hosts ({ingress.hosts.length})
              </Text>
              <Stack gap="xs">
                {ingress.hosts.map((host, index) => {
                  // Create URLs from hosts (if not already present in urls)
                  const hostUrl =
                    ingress.urls && Array.isArray(ingress.urls) && ingress.urls.length > 0
                      ? ingress.urls.find((url) => url.includes(host))
                      : null;

                  const finalUrl = hostUrl || (host.startsWith('http') ? host : `https://${host}`);

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="xs"
                      fullWidth
                      justify="space-between"
                      onClick={() => handleLinkClick(finalUrl)}
                      title={finalUrl}
                      rightSection={<IconExternalLink size={12} />}
                      styles={{
                        root: { height: '32px' },
                        inner: { justifyContent: 'space-between' },
                        label: { overflow: 'hidden', textOverflow: 'ellipsis' },
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {finalUrl}
                      </span>
                    </Button>
                  );
                })}
              </Stack>
            </Stack>
          )}

          {/* Paths - updated to list format */}
          {ingress.paths.length > 0 &&
            (() => {
              const uniquePaths = Array.from(new Set(ingress.paths));
              return (
                <Stack gap="xs">
                  <Text size="xs" fw={500}>
                    Paths ({uniquePaths.length})
                  </Text>
                  <Stack gap="xs">
                    {uniquePaths.map((path, index) => (
                      <div
                        key={index}
                        className="w-full justify-start h-8 text-xs px-3 truncate border border-input rounded-md bg-transparent flex items-center"
                      >
                        {path}
                      </div>
                    ))}
                  </Stack>
                </Stack>
              );
            })()}
        </Stack>

        {/* Footer Section */}
        <Group gap="xs" wrap="wrap">
          {ingress.annotations['kubernetes.io/ingress.class'] && (
            <Badge variant="light" size="sm">
              {ingress.annotations['kubernetes.io/ingress.class']}
            </Badge>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

/**
 * Memoized IngressCard component with custom comparison function.
 * Only re-renders when ingress data actually changes (based on id and creationTimestamp).
 */
const IngressCard = memo(IngressCardComponent, (prevProps, nextProps) => {
  // Compare ingress data efficiently using stable identifiers
  const prevIngress = prevProps.ingress;
  const nextIngress = nextProps.ingress;

  // If the ingress ID or creation timestamp changed, re-render
  if (
    prevIngress.id !== nextIngress.id ||
    prevIngress.creationTimestamp !== nextIngress.creationTimestamp
  ) {
    return false; // Props changed, re-render
  }

  // Check if any meaningful data changed
  const dataChanged =
    prevIngress.name !== nextIngress.name ||
    prevIngress.namespace !== nextIngress.namespace ||
    prevIngress.tls !== nextIngress.tls ||
    prevIngress.status !== nextIngress.status ||
    prevIngress.hosts.length !== nextIngress.hosts.length ||
    prevIngress.paths.length !== nextIngress.paths.length ||
    prevIngress.urls.length !== nextIngress.urls.length ||
    JSON.stringify(prevIngress.hosts) !== JSON.stringify(nextIngress.hosts) ||
    JSON.stringify(prevIngress.paths) !== JSON.stringify(nextIngress.paths) ||
    JSON.stringify(prevIngress.annotations) !== JSON.stringify(nextIngress.annotations);

  // Compare callback function references
  const onClickChanged = prevProps.onClick !== nextProps.onClick;
  const onDetailsClickChanged = prevProps.onDetailsClick !== nextProps.onDetailsClick;

  // Return true if nothing changed (skip re-render), false if something changed (re-render)
  return !dataChanged && !onClickChanged && !onDetailsClickChanged;
});

IngressCard.displayName = 'IngressCard';

export default IngressCard;
