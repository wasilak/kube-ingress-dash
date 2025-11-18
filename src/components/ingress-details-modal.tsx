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
      transitionProps={{
        transition: 'scale',
        duration: 250,
        timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      styles={{
        content: {
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
        },
        header: {
          backgroundColor: 'hsl(var(--background))',
          borderBottom: '1px solid hsl(var(--border))',
        },
        title: {
          color: 'hsl(var(--foreground))',
          fontWeight: 600,
        },
        body: {
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          backgroundColor: 'hsl(var(--background))',
        },
        close: {
          color: 'hsl(var(--foreground))',
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
            className="animate-slide-up"
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
                <Stack gap="md" className="animate-slide-up">
                  <Text
                    fw={600}
                    size="sm"
                    tt="uppercase"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Details
                  </Text>
                  <Divider />
                  <Stack gap="sm">
                    {/* Name */}
                    <Group gap="xs" wrap="nowrap">
                      <Text
                        size="sm"
                        fw={500}
                        style={{ minWidth: '120px', color: 'hsl(var(--muted-foreground))' }}
                      >
                        Name:
                      </Text>
                      <Text size="sm" style={{ color: 'hsl(var(--foreground))' }}>
                        {ingress.name}
                      </Text>
                    </Group>

                    {/* Namespace */}
                    <Group gap="xs" wrap="nowrap">
                      <Text
                        size="sm"
                        fw={500}
                        style={{ minWidth: '120px', color: 'hsl(var(--muted-foreground))' }}
                      >
                        Namespace:
                      </Text>
                      <Group gap="xs">
                        <IconFolder size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        <Text size="sm" style={{ color: 'hsl(var(--foreground))' }}>
                          {ingress.namespace}
                        </Text>
                      </Group>
                    </Group>

                    {/* TLS */}
                    <Group gap="xs" wrap="nowrap">
                      <Text
                        size="sm"
                        fw={500}
                        style={{ minWidth: '120px', color: 'hsl(var(--muted-foreground))' }}
                      >
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
                        <Text
                          size="sm"
                          fw={500}
                          style={{ minWidth: '120px', color: 'hsl(var(--muted-foreground))' }}
                        >
                          Ingress Class:
                        </Text>
                        <Badge variant="outline" size="sm">
                          {ingress.annotations['kubernetes.io/ingress.class']}
                        </Badge>
                      </Group>
                    )}

                    {/* Creation Timestamp */}
                    <Group gap="xs" wrap="nowrap" align="flex-start">
                      <Text
                        size="sm"
                        fw={500}
                        style={{ minWidth: '120px', color: 'hsl(var(--muted-foreground))' }}
                      >
                        Created:
                      </Text>
                      <Group gap="xs">
                        <IconClock size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        <Text size="sm" style={{ color: 'hsl(var(--foreground))' }}>
                          {formatTimestamp(ingress.creationTimestamp)}
                        </Text>
                      </Group>
                    </Group>
                  </Stack>
                </Stack>
              </ModalSectionErrorBoundary>

              {/* Configuration Section */}
              <ModalSectionErrorBoundary sectionName="Configuration">
                <Stack gap="md" className="animate-slide-up" style={{ animationDelay: '50ms' }}>
                  <Text
                    fw={600}
                    size="sm"
                    tt="uppercase"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    Configuration
                  </Text>
                  <Divider />

                  {/* Hosts */}
                  {ingress.hosts.length > 0 && (
                    <Stack gap="xs">
                      <Text size="xs" fw={500} style={{ color: 'hsl(var(--foreground))' }}>
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

                  {/* Paths */}
                  {ingress.paths.length > 0 && (
                    <Stack gap="xs">
                      <Text size="xs" fw={500} style={{ color: 'hsl(var(--foreground))' }}>
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
                  )}
                </Stack>
              </ModalSectionErrorBoundary>

              {/* Labels Section */}
              <ModalSectionErrorBoundary sectionName="Labels">
                <Stack gap="md" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
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
                        <Text
                          fw={600}
                          size="sm"
                          tt="uppercase"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        >
                          Labels
                        </Text>
                        <Text size="sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          ({labelCount})
                        </Text>
                      </Group>
                      <Divider />
                      <Collapse
                        in={labelsExpanded}
                        transitionDuration={300}
                        transitionTimingFunction="ease"
                      >
                        <Table className="animate-fade-in">
                          <Table.Tbody>
                            {ingress.labels &&
                              Object.entries(ingress.labels).map(([key, value]) => (
                                <Table.Tr key={key}>
                                  <Table.Td>
                                    <Text
                                      size="sm"
                                      fw={600}
                                      style={{ color: 'hsl(var(--primary))' }}
                                    >
                                      {key}
                                    </Text>
                                  </Table.Td>
                                  <Table.Td>
                                    <Text size="sm" style={{ color: 'hsl(var(--foreground))' }}>
                                      {value}
                                    </Text>
                                  </Table.Td>
                                </Table.Tr>
                              ))}
                          </Table.Tbody>
                        </Table>
                      </Collapse>
                    </>
                  ) : (
                    <>
                      <Text
                        fw={600}
                        size="sm"
                        tt="uppercase"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        Labels
                      </Text>
                      <Divider />
                      <Alert color="gray" variant="light">
                        <Text size="sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          No labels defined
                        </Text>
                      </Alert>
                    </>
                  )}
                </Stack>
              </ModalSectionErrorBoundary>

              {/* Annotations Section */}
              <ModalSectionErrorBoundary sectionName="Annotations">
                <Stack gap="md" className="animate-slide-up" style={{ animationDelay: '150ms' }}>
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
                        <Text
                          fw={600}
                          size="sm"
                          tt="uppercase"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        >
                          Annotations
                        </Text>
                        <Text size="sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          ({annotationCount})
                        </Text>
                      </Group>
                      <Divider />
                      <Collapse
                        in={annotationsExpanded}
                        transitionDuration={300}
                        transitionTimingFunction="ease"
                      >
                        <Table className="animate-fade-in">
                          <Table.Tbody>
                            {Object.entries(ingress.annotations).map(([key, value]) => (
                              <Table.Tr key={key}>
                                <Table.Td>
                                  <Text size="sm" fw={600} style={{ color: 'hsl(var(--primary))' }}>
                                    {key}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" style={{ color: 'hsl(var(--foreground))' }}>
                                    {value}
                                  </Text>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Collapse>
                    </>
                  ) : (
                    <>
                      <Text
                        fw={600}
                        size="sm"
                        tt="uppercase"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        Annotations
                      </Text>
                      <Divider />
                      <Alert color="gray" variant="light">
                        <Text size="sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
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
              <Stack gap="md" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Group justify="space-between" align="center">
                  <Text
                    fw={600}
                    size="sm"
                    tt="uppercase"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
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
                          className={copied ? 'copy-success' : ''}
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
                      fontSize: '12px',
                      padding: '12px',
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--mantine-radius-md)',
                      fontFamily: 'var(--mantine-font-family-monospace)',
                      whiteSpace: 'pre',
                      color: 'hsl(var(--foreground))',
                      cursor: 'text',
                      transition: 'border-color 150ms ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'hsl(var(--border))';
                    }}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.currentTarget) {
                        e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.currentTarget) {
                        e.currentTarget.style.borderColor = 'hsl(var(--border))';
                      }
                    }}
                    tabIndex={0}
                  >
                    {ingress.yamlManifest}
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
