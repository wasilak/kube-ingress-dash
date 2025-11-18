'use client';

import React, { memo } from 'react';
import {
  Button,
  Badge,
  Card,
  Text,
  Stack,
  Group,
  Divider,
  CopyButton,
  ActionIcon,
  Tooltip,
  Box,
} from '@mantine/core';
import { IconExternalLink, IconLock, IconFolder, IconCopy, IconCheck } from '@tabler/icons-react';
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
      padding="lg"
      radius="md"
      withBorder
      className="hover-lift animate-fade-in"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Header Section */}
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md">
        <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
          <Text
            fw={600}
            className="text-base leading-tight break-words hyphens-auto"
            style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
          >
            {ingress.name}
          </Text>
          <Group gap={4} wrap="nowrap">
            <IconFolder size={12} className="flex-shrink-0" style={{ opacity: 0.6 }} />
            <Text size="xs" c="dimmed" className="leading-tight break-words">
              {ingress.namespace}
            </Text>
          </Group>
        </Stack>
        {ingress.tls && <IconLock size={20} className="text-primary flex-shrink-0" />}
      </Group>

      {/* Content Section */}
      <Stack gap="md">
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
                  <Group key={index} gap="xs" wrap="nowrap" justify="space-between">
                    <Button
                      variant="outline"
                      size="xs"
                      fullWidth
                      justify="space-between"
                      onClick={() => handleLinkClick(finalUrl)}
                      title={finalUrl}
                      rightSection={<IconExternalLink size={12} />}
                      styles={{
                        root: {
                          height: '32px',
                          flex: 1,
                        },
                        inner: { justifyContent: 'space-between' },
                        label: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {finalUrl}
                      </span>
                    </Button>
                    <CopyButton value={finalUrl}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow>
                          <ActionIcon
                            color={copied ? 'teal' : 'gray'}
                            variant="subtle"
                            onClick={copy}
                            className={copied ? 'copy-success' : ''}
                          >
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
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
                    <Group key={index} gap="xs" wrap="nowrap" justify="space-between">
                      <Box
                        style={{
                          flex: 1,
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 12px',
                          fontSize: '12px',
                          border: '1px solid var(--mantine-color-default-border)',
                          borderRadius: 'var(--mantine-radius-default)',
                          backgroundColor: 'transparent',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {path}
                      </Box>
                      <CopyButton value={path}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow>
                            <ActionIcon
                              color={copied ? 'teal' : 'gray'}
                              variant="subtle"
                              onClick={copy}
                              className={copied ? 'copy-success' : ''}
                            >
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  ))}
                </Stack>
              </Stack>
            );
          })()}
      </Stack>

      {/* Footer Section */}
      {ingress.annotations['kubernetes.io/ingress.class'] && (
        <Group gap="xs" wrap="wrap" mt="md">
          <Badge variant="light" size="sm">
            {ingress.annotations['kubernetes.io/ingress.class']}
          </Badge>
        </Group>
      )}

      {/* Show Details Button */}
      {onDetailsClick && (
        <>
          <Divider my="md" />
          <Button variant="outline" size="sm" fullWidth onClick={onDetailsClick}>
            Show details
          </Button>
        </>
      )}
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
