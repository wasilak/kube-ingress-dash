'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Badge,
  Group,
  Divider,
  ActionIcon,
  Code,
  Alert,
  Collapse,
  Button,
  Box,
} from '@mantine/core';
import {
  IconLock,
  IconFolder,
  IconClock,
  IconCopy,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconWorld,
  IconRoute,
} from '@tabler/icons-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IngressData } from '@/types/ingress';

interface IngressDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  ingress: IngressData | null;
}

export const IngressDetailsModal: React.FC<IngressDetailsModalProps> = ({
  opened,
  onClose,
  ingress,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [annotationsExpanded, setAnnotationsExpanded] = useState(true);
  const [yamlExpanded, setYamlExpanded] = useState(false);
  const [yamlCopied, setYamlCopied] = useState(false);

  if (!ingress) {
    return null;
  }

  // Format timestamp for readability
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ready':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Copy to clipboard handler
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Copy YAML to clipboard
  const handleCopyYaml = async () => {
    if (!ingress.yamlManifest) return;
    try {
      await navigator.clipboard.writeText(ingress.yamlManifest);
      setYamlCopied(true);
      setTimeout(() => setYamlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy YAML:', error);
    }
  };

  // Check if annotation is a known/special annotation
  const isKnownAnnotation = (key: string): boolean => {
    const knownPrefixes = [
      'kubernetes.io/',
      'nginx.ingress.kubernetes.io/',
      'cert-manager.io/',
      'external-dns.alpha.kubernetes.io/',
    ];
    return knownPrefixes.some((prefix) => key.startsWith(prefix));
  };

  // Get annotation count
  const annotationCount = Object.keys(ingress.annotations).length;
  const shouldCollapseAnnotations = annotationCount > 5;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={ingress.name}
      size="xl"
      styles={{
        body: {
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
        },
      }}
    >
      <Stack gap="xl">
        {/* Main Details Section */}
        <Stack gap="md">
          <Text fw={600} size="sm" tt="uppercase" c="dimmed">
            Details
          </Text>
          <Divider />
          <Stack gap="sm">
            {/* Name */}
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                Name:
              </Text>
              <Text size="sm">{ingress.name}</Text>
            </Group>

            {/* Namespace */}
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                Namespace:
              </Text>
              <Group gap="xs">
                <IconFolder size={14} />
                <Text size="sm">{ingress.namespace}</Text>
              </Group>
            </Group>

            {/* Status */}
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                Status:
              </Text>
              <Badge color={getStatusColor(ingress.status)} variant="light" size="sm">
                {ingress.status.toUpperCase()}
              </Badge>
            </Group>

            {/* TLS */}
            <Group gap="xs" wrap="nowrap">
              <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                TLS:
              </Text>
              {ingress.tls ? (
                <Group gap="xs">
                  <IconLock size={14} className="text-primary" />
                  <Badge color="blue" variant="light" size="sm">
                    Enabled
                  </Badge>
                </Group>
              ) : (
                <Badge color="gray" variant="light" size="sm">
                  Disabled
                </Badge>
              )}
            </Group>

            {/* Ingress Class */}
            {ingress.annotations['kubernetes.io/ingress.class'] && (
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                  Ingress Class:
                </Text>
                <Badge variant="outline" size="sm">
                  {ingress.annotations['kubernetes.io/ingress.class']}
                </Badge>
              </Group>
            )}

            {/* Creation Timestamp */}
            <Group gap="xs" wrap="nowrap" align="flex-start">
              <Text size="sm" fw={500} style={{ minWidth: '120px' }}>
                Created:
              </Text>
              <Group gap="xs">
                <IconClock size={14} />
                <Text size="sm">{formatTimestamp(ingress.creationTimestamp)}</Text>
              </Group>
            </Group>
          </Stack>
        </Stack>

        {/* Labels Section */}
        <Stack gap="md">
          <Text fw={600} size="sm" tt="uppercase" c="dimmed">
            Labels
          </Text>
          <Divider />
          {ingress.labels && Object.keys(ingress.labels).length > 0 ? (
            <Stack gap="xs">
              {Object.entries(ingress.labels).map(([key, value]) => (
                <Group key={key} gap="xs" wrap="nowrap" align="flex-start">
                  <Code
                    style={{
                      flex: 1,
                      wordBreak: 'break-all',
                      padding: '8px 12px',
                    }}
                  >
                    <Group gap="xs" wrap="nowrap" justify="space-between">
                      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                        <Text size="xs" fw={600} c="blue">
                          {key}
                        </Text>
                        <Text size="xs" style={{ wordBreak: 'break-all' }}>
                          {value}
                        </Text>
                      </Stack>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={() => handleCopy(value, `label-${key}`)}
                        aria-label={`Copy ${key} value`}
                      >
                        {copiedKey === `label-${key}` ? (
                          <IconCheck size={14} />
                        ) : (
                          <IconCopy size={14} />
                        )}
                      </ActionIcon>
                    </Group>
                  </Code>
                </Group>
              ))}
            </Stack>
          ) : (
            <Alert color="gray" variant="light">
              <Text size="sm" c="dimmed">
                No labels defined
              </Text>
            </Alert>
          )}
        </Stack>

        {/* Annotations Section */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm" tt="uppercase" c="dimmed">
              Annotations ({annotationCount})
            </Text>
            {shouldCollapseAnnotations && (
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setAnnotationsExpanded(!annotationsExpanded)}
                rightSection={
                  annotationsExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                }
              >
                {annotationsExpanded ? 'Collapse' : 'Expand'}
              </Button>
            )}
          </Group>
          <Divider />
          {annotationCount > 0 ? (
            <Collapse in={annotationsExpanded || !shouldCollapseAnnotations}>
              <Stack gap="xs">
                {Object.entries(ingress.annotations).map(([key, value]) => (
                  <Group key={key} gap="xs" wrap="nowrap" align="flex-start">
                    <Code
                      style={{
                        flex: 1,
                        wordBreak: 'break-all',
                        padding: '8px 12px',
                        backgroundColor: isKnownAnnotation(key)
                          ? 'var(--mantine-color-blue-0)'
                          : undefined,
                      }}
                    >
                      <Group gap="xs" wrap="nowrap" justify="space-between">
                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs">
                            <Text size="xs" fw={600} c={isKnownAnnotation(key) ? 'blue' : 'gray'}>
                              {key}
                            </Text>
                            {isKnownAnnotation(key) && (
                              <Badge size="xs" variant="light" color="blue">
                                Known
                              </Badge>
                            )}
                          </Group>
                          <Text size="xs" style={{ wordBreak: 'break-all' }}>
                            {value}
                          </Text>
                        </Stack>
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => handleCopy(value, `annotation-${key}`)}
                          aria-label={`Copy ${key} value`}
                        >
                          {copiedKey === `annotation-${key}` ? (
                            <IconCheck size={14} />
                          ) : (
                            <IconCopy size={14} />
                          )}
                        </ActionIcon>
                      </Group>
                    </Code>
                  </Group>
                ))}
              </Stack>
            </Collapse>
          ) : (
            <Alert color="gray" variant="light">
              <Text size="sm" c="dimmed">
                No annotations defined
              </Text>
            </Alert>
          )}
        </Stack>

        {/* Ingress Configuration Section */}
        <Stack gap="md">
          <Text fw={600} size="sm" tt="uppercase" c="dimmed">
            Configuration
          </Text>
          <Divider />

          {/* Hosts */}
          {ingress.hosts.length > 0 && (
            <Stack gap="xs">
              <Group gap="xs">
                <IconWorld size={16} />
                <Text size="sm" fw={500}>
                  Hosts ({ingress.hosts.length})
                </Text>
              </Group>
              <Stack gap="xs" pl="md">
                {ingress.hosts.map((host, index) => {
                  const hostUrl =
                    ingress.urls && Array.isArray(ingress.urls) && ingress.urls.length > 0
                      ? ingress.urls.find((url) => url.includes(host))
                      : null;
                  const finalUrl = hostUrl || (host.startsWith('http') ? host : `https://${host}`);

                  return (
                    <Group key={index} gap="xs" wrap="nowrap">
                      <Code style={{ flex: 1 }}>{host}</Code>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        component="a"
                        href={finalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${host}`}
                      >
                        <IconExternalLink size={14} />
                      </ActionIcon>
                    </Group>
                  );
                })}
              </Stack>
            </Stack>
          )}

          {/* Paths */}
          {ingress.paths.length > 0 && (
            <Stack gap="xs">
              <Group gap="xs">
                <IconRoute size={16} />
                <Text size="sm" fw={500}>
                  Paths ({ingress.paths.length})
                </Text>
              </Group>
              <Stack gap="xs" pl="md">
                {Array.from(new Set(ingress.paths)).map((path, index) => (
                  <Code key={index} style={{ display: 'block' }}>
                    {path}
                  </Code>
                ))}
              </Stack>
            </Stack>
          )}

          {/* URLs (if different from hosts) */}
          {ingress.urls && ingress.urls.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Full URLs
              </Text>
              <Stack gap="xs" pl="md">
                {ingress.urls.map((url, index) => (
                  <Group key={index} gap="xs" wrap="nowrap">
                    <Code style={{ flex: 1, wordBreak: 'break-all' }}>{url}</Code>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      component="a"
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${url}`}
                    >
                      <IconExternalLink size={14} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>

        {/* YAML Manifest Section */}
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm" tt="uppercase" c="dimmed">
              YAML Manifest
            </Text>
            <Group gap="xs">
              {ingress.yamlManifest && (
                <Button
                  variant="light"
                  size="xs"
                  leftSection={yamlCopied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                  onClick={handleCopyYaml}
                  color={yamlCopied ? 'green' : 'blue'}
                >
                  {yamlCopied ? 'Copied!' : 'Copy YAML'}
                </Button>
              )}
              <Button
                variant="subtle"
                size="xs"
                onClick={() => setYamlExpanded(!yamlExpanded)}
                rightSection={
                  yamlExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                }
              >
                {yamlExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </Group>
          </Group>
          <Divider />
          <Collapse in={yamlExpanded}>
            {ingress.yamlManifest ? (
              <Box
                style={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--mantine-color-gray-3)',
                }}
              >
                <SyntaxHighlighter
                  language="yaml"
                  style={vscDarkPlus}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    fontSize: '12px',
                    maxHeight: '500px',
                  }}
                >
                  {ingress.yamlManifest}
                </SyntaxHighlighter>
              </Box>
            ) : (
              <Alert color="yellow" variant="light">
                <Text size="sm">
                  YAML manifest not available. This may occur if the ingress data was fetched
                  without the manifest field.
                </Text>
              </Alert>
            )}
          </Collapse>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default IngressDetailsModal;
