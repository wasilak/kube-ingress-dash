'use client';

import { Title, Text, Tabs, Button } from '@mantine/core';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { IconFolder, IconTag, IconNote, IconArrowLeft } from '@tabler/icons-react';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes('/namespaces')) return 'namespaces';
    if (pathname.includes('/labels')) return 'labels';
    if (pathname.includes('/annotations')) return 'annotations';
    return 'namespaces';
  };

  const handleTabChange = (value: string | null) => {
    if (value) {
      router.push(`/settings/${value}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <PageHeader />

        <Title order={1} mb="md">
          Settings
        </Title>
        <Text c="dimmed" mb="xl">
          Configure which labels, namespaces, and annotations appear in dashboard filters.
        </Text>

        <Tabs value={getActiveTab()} onChange={handleTabChange} variant="outline">
          <Tabs.List>
            <Tabs.Tab value="namespaces" leftSection={<IconFolder size={16} />}>
              Namespaces
            </Tabs.Tab>
            <Tabs.Tab value="labels" leftSection={<IconTag size={16} />}>
              Labels
            </Tabs.Tab>
            <Tabs.Tab value="annotations" leftSection={<IconNote size={16} />}>
              Annotations
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value={getActiveTab()} pt="md">
            {children}
          </Tabs.Panel>
        </Tabs>

        <Button
          component={Link}
          href="/"
          variant="outline"
          size="xs"
          mt="xl"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
