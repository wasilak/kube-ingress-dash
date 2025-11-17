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
  Alert,
  Collapse,
  Button,
  Box,
  Grid,
  CopyButton,
  Tooltip,
  Table,
} from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import {
  IconLock,
  IconFolder,
  IconClock,
  IconCopy,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
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
  const [labelsExpanded, setLabelsExpanded] = useState(false);
  const [annotationsExpanded, setAnnotationsExpanded] = useState(false);
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

  // Retry YAML generation
  const handleRetryYaml = () => {
    setYamlError(null);
  };

  // Handle link click
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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

              {/* Configuration Section */}
              <ModalSectionErrorBoundary sectionName="Configuration">
                <Stack gap="md">
                  <Text fw={600} size="sm" tt="uppercase" c="dimmed">
                    Configuration
                  </Text>
                  <Divider />

                  {/* Hosts */}
                  {ingress.hosts.length > 0 && (
                    <Stack gap="xs">
                      <Text size="xs" fw={500}>
                        Hosts ({ingress.hosts.length})
                      </Text>
                      <Stack gap="xs">
                        {ingress.hosts.map((host, index) => {
                          const hostUrl =
                            ingress.urls && Array.isArray(ingress.urls) && ingress.urls.length > 0
                              ? ingress.urls.find((url) => url.includes(host))
                              : null;
                          const finalUrl =
                            hostUrl || (host.startsWith('http') ? host : `https://${host}`);

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

                  {/* Paths */}
                  {ingress.paths.length > 0 && (
                    <Stack gap="xs">
                      <Text size="xs" fw={500}>
                        Paths ({Array.from(new Set(ingress.paths)).length})
                      </Text>
                      <Stack gap="xs">
                        {Array.from(new Set(ingress.paths)).map((path, index) => (
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
                        <Table>
                          <Table.Tbody>
                            {ingress.labels &&
                              Object.entries(ingress.labels).map(([key, value]) => (
                                <Table.Tr key={key}>
                                  <Table.Td>
                                    <Text size="sm" fw={600} c="blue">
                                      {key}
                                    </Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Text size="sm">{value}</Text>
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                          </Table.Tbody>
                        </Table>
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
                        <Table>
                          <Table.Tbody>
                            {Object.entries(ingress.annotations).map(([key, value]) => (
                              <Table.Tr key={key}>
                                <Table.Td>
                                  <Text size="sm" fw={600} c="blue">
                                    {key}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm">{value}</Text>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
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
                  {ingress.yamlManifest && (
                    <CopyButton value={ingress.yamlManifest}>
                      {({ copied, copy }) => (
                        <Button
                          variant="light"
                          size="xs"
                          leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          onClick={copy}
                          color={copied ? 'teal' : 'blue'}
                        >
                          {copied ? 'Copied!' : 'Copy YAML'}
                        </Button>
                      )}
                    </CopyButton>
                  )}
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
                      maxHeight: 'calc(100vh - 300px)',
                      overflowY: 'auto',
                    }}
                  >
                    <CodeHighlight
                      code={ingress.yamlManifest}
                      language="yaml"
                      styles={{
                        pre: {
                          margin: 0,
                          padding: '12px',
                          fontSize: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--mantine-color-default-border)',
                        },
                        code: {
                          padding: 0,
                        },
                      }}
                    />
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
