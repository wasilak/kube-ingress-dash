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
  Loader,
  Grid,
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
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IngressData } from '@/types/ingress';
import { ModalSectionErrorBoundary } from '@/components/error-boundaries';

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
  const [labelsExpanded, setLabelsExpanded] = useState(false);
  const [annotationsExpanded, setAnnotationsExpanded] = useState(false);
  const [yamlCopied, setYamlCopied] = useState(false);
  const [yamlLoading, setYamlLoading] = useState(false);
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);

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

  // Copy to clipboard handler
  const handleCopy = async (text: string, key: string) => {
    try {
      setCopyError(null);
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to copy to clipboard';
      setCopyError(errorMessage);
      setTimeout(() => setCopyError(null), 3000);
    }
  };

  // Copy YAML to clipboard
  const handleCopyYaml = async () => {
    if (!ingress.yamlManifest) return;
    try {
      setCopyError(null);
      setYamlLoading(true);
      await navigator.clipboard.writeText(ingress.yamlManifest);
      setYamlCopied(true);
      setTimeout(() => setYamlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy YAML:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to copy YAML to clipboard';
      setCopyError(errorMessage);
      setTimeout(() => setCopyError(null), 3000);
    } finally {
      setYamlLoading(false);
    }
  };

  // Retry YAML generation
  const handleRetryYaml = () => {
    setYamlError(null);
    // In a real scenario, this would trigger a re-fetch of the YAML manifest
    // For now, we just clear the error state
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

  // Get counts
  const annotationCount = Object.keys(ingress.annotations).length;
  const labelCount = ingress.labels ? Object.keys(ingress.labels).length : 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={ingress.name}
      size="95%"
      styles={{
        body: {
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
        },
      }}
    >
      <Stack gap="md">
        {/* Copy Error Alert */}
        {copyError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Copy Failed"
            color="red"
            variant="light"
            withCloseButton
            onClose={() => setCopyError(null)}
          >
            <Text size="sm">{copyError}</Text>
          </Alert>
        )}

        {/* Two Column Layout */}
        <Grid gutter="xl">
          {/* Left Column - Details and Configuration */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="xl">
              {/* Main Details Section */}
              <ModalSectionErrorBoundary sectionName="Details">
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
              </ModalSectionErrorBoundary>

              {/* Ingress Configuration Section */}
              <ModalSectionErrorBoundary sectionName="Configuration">
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
                          const finalUrl =
                            hostUrl || (host.startsWith('http') ? host : `https://${host}`);

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
              </ModalSectionErrorBoundary>

              {/* Labels Section */}
              <ModalSectionErrorBoundary sectionName="Labels">
                <Stack gap="md">
                  {labelCount > 0 ? (
                    <>
                      <Group
                        gap="sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setLabelsExpanded(!labelsExpanded)}
                      >
                        <ActionIcon
                          variant="subtle"
                          size="lg"
                          aria-label={labelsExpanded ? 'Collapse labels' : 'Expand labels'}
                        >
                          {labelsExpanded ? (
                            <IconChevronUp size={20} />
                          ) : (
                            <IconChevronDown size={20} />
                          )}
                        </ActionIcon>
                        <Text fw={600} size="sm" tt="uppercase" c="dimmed">
                          Labels
                        </Text>
                        <Text size="sm" c="dimmed">
                          ({labelCount})
                        </Text>
                      </Group>
                      <Divider />
                      <Collapse in={labelsExpanded}>
                        <Stack gap="xs">
                          {ingress.labels &&
                            Object.entries(ingress.labels).map(([key, value]) => (
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(value, `label-${key}`);
                                      }}
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
                      </Collapse>
                    </>
                  ) : (
                    <>
                      <Text fw={600} size="sm" tt="uppercase" c="dimmed">
                        Labels
                      </Text>
                      <Divider />
                      <Alert color="gray" variant="light">
                        <Text size="sm" c="dimmed">
                          No labels defined
                        </Text>
                      </Alert>
                    </>
                  )}
                </Stack>
              </ModalSectionErrorBoundary>

              {/* Annotations Section */}
              <ModalSectionErrorBoundary sectionName="Annotations">
                <Stack gap="md">
                  {annotationCount > 0 ? (
                    <>
                      <Group
                        gap="sm"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setAnnotationsExpanded(!annotationsExpanded)}
                      >
                        <ActionIcon
                          variant="subtle"
                          size="lg"
                          aria-label={
                            annotationsExpanded ? 'Collapse annotations' : 'Expand annotations'
                          }
                        >
                          {annotationsExpanded ? (
                            <IconChevronUp size={20} />
                          ) : (
                            <IconChevronDown size={20} />
                          )}
                        </ActionIcon>
                        <Text fw={600} size="sm" tt="uppercase" c="dimmed">
                          Annotations
                        </Text>
                        <Text size="sm" c="dimmed">
                          ({annotationCount})
                        </Text>
                      </Group>
                      <Divider />
                      <Collapse in={annotationsExpanded}>
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
                                      <Text
                                        size="xs"
                                        fw={600}
                                        c={isKnownAnnotation(key) ? 'blue' : 'gray'}
                                      >
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(value, `annotation-${key}`);
                                    }}
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
                    </>
                  ) : (
                    <>
                      <Text fw={600} size="sm" tt="uppercase" c="dimmed">
                        Annotations
                      </Text>
                      <Divider />
                      <Alert color="gray" variant="light">
                        <Text size="sm" c="dimmed">
                          No annotations defined
                        </Text>
                      </Alert>
                    </>
                  )}
                </Stack>
              </ModalSectionErrorBoundary>
            </Stack>
          </Grid.Col>

          {/* Right Column - YAML Manifest */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <ModalSectionErrorBoundary sectionName="YAML Manifest">
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
                        leftSection={
                          yamlLoading ? (
                            <Loader size={14} />
                          ) : yamlCopied ? (
                            <IconCheck size={14} />
                          ) : (
                            <IconCopy size={14} />
                          )
                        }
                        onClick={handleCopyYaml}
                        color={yamlCopied ? 'green' : 'blue'}
                        disabled={yamlLoading}
                      >
                        {yamlLoading ? 'Copying...' : yamlCopied ? 'Copied!' : 'Copy YAML'}
                      </Button>
                    )}
                  </Group>
                </Group>
                <Divider />
                {yamlError ? (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="YAML Generation Error"
                    color="red"
                    variant="light"
                  >
                    <Stack gap="sm">
                      <Text size="sm">{yamlError}</Text>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconRefresh size={14} />}
                        onClick={handleRetryYaml}
                      >
                        Retry
                      </Button>
                    </Stack>
                  </Alert>
                ) : ingress.yamlManifest ? (
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
                        maxHeight: 'calc(100vh - 300px)',
                      }}
                    >
                      {ingress.yamlManifest}
                    </SyntaxHighlighter>
                  </Box>
                ) : (
                  <Alert color="yellow" variant="light">
                    <Stack gap="xs">
                      <Text size="sm">
                        YAML manifest not available. This may occur if the ingress data was fetched
                        without the manifest field.
                      </Text>
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconRefresh size={14} />}
                        onClick={handleRetryYaml}
                      >
                        Retry Loading
                      </Button>
                    </Stack>
                  </Alert>
                )}
              </Stack>
            </ModalSectionErrorBoundary>
          </Grid.Col>
        </Grid>
      </Stack>
    </Modal>
  );
};

export default IngressDetailsModal;
