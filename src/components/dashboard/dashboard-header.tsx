import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Group, Anchor } from '@mantine/core';
import { ThemeToggle } from '@/components/theme-toggle';

export const DashboardHeader: React.FC = () => {
  return (
    <header>
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Group gap="sm">
          <Image src="/images/logo.svg" alt="Kube Ingress Dash logo" width={40} height={40} />
          <Link href="/" passHref legacyBehavior>
            <Anchor component="a" underline="never" c="inherit">
              <h1 className="text-3xl font-bold">Kube Ingress Dash</h1>
            </Anchor>
          </Link>
          <Link href="/settings" passHref legacyBehavior>
            <Anchor component="a" size="sm" ml="md">
              Settings
            </Anchor>
          </Link>
        </Group>

        <ThemeToggle />
      </Group>
    </header>
  );
};
