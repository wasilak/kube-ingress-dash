import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Group, Anchor, Button } from '@mantine/core';
import { IconSettings, IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';

export const DashboardHeader: React.FC = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const cycleTheme = () => {
    if (colorScheme === 'light') {
      setColorScheme('dark');
    } else if (colorScheme === 'dark') {
      setColorScheme('auto');
    } else {
      setColorScheme('light');
    }
  };

  const getThemeIcon = () => {
    if (colorScheme === 'auto') {
      return <IconDeviceDesktop size={16} />;
    }
    return computedColorScheme === 'dark' ? <IconMoon size={16} /> : <IconSun size={16} />;
  };

  const getThemeLabel = () => {
    if (colorScheme === 'auto') {
      return 'System';
    }
    return computedColorScheme === 'dark' ? 'Dark' : 'Light';
  };

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
        </Group>

        <Group gap="xs">
          <Link href="/settings" passHref legacyBehavior>
            <Button
              component="a"
              variant="outline"
              size="xs"
              leftSection={<IconSettings size={16} />}
            >
              Settings
            </Button>
          </Link>
          <Button
            variant="outline"
            size="xs"
            onClick={cycleTheme}
            leftSection={getThemeIcon()}
            title={`${getThemeLabel()} mode`}
          >
            {getThemeLabel()}
          </Button>
        </Group>
      </Group>
    </header>
  );
};
