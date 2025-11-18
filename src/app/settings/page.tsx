'use client';

import { Container, Title, Text, Tabs } from '@mantine/core';
import Link from 'next/link';
import { SettingsTabs } from '@/components/settings-tabs';
import { LabelExclusionSettings } from '@/components/label-exclusion-settings';
import { NamespaceExclusionSettings } from '@/components/namespace-exclusion-settings';
import { AnnotationExclusionSettings } from '@/components/annotation-exclusion-settings';
import { PageHeader } from '@/components/page-header';

export default function SettingsPage() {
  return (
    <Container size="lg" py="xl">
      <PageHeader />

      <Title order={1} mb="md">
        Settings
      </Title>
      <Text c="dimmed" mb="xl">
        Configure filter exclusions for labels, namespaces, and annotations.
      </Text>

      <SettingsTabs>
        <Tabs.Panel value="labels" pt="md">
          <LabelExclusionSettings />
        </Tabs.Panel>

        <Tabs.Panel value="namespaces" pt="md">
          <NamespaceExclusionSettings />
        </Tabs.Panel>

        <Tabs.Panel value="annotations" pt="md">
          <AnnotationExclusionSettings />
        </Tabs.Panel>
      </SettingsTabs>

      <Text mt="xl">
        <Link href="/" style={{ color: 'var(--mantine-color-blue-6)' }}>
          ← Back to Dashboard
        </Link>
      </Text>
    </Container>
  );
}
