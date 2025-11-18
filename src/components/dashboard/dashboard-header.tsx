import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Group, Anchor, Button, Divider } from '@mantine/core';
import { IconSettings, IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';

export const DashboardHeader: React.FC = () => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!mounted) return <IconSun size={16} />;
    if (colorScheme === 'auto') {
      return <IconDeviceDesktop size={16} />;
    }
    return computedColorScheme === 'dark' ? <IconMoon size={16} /> : <IconSun size={16} />;
  };

  const getThemeLabel = () => {
    if (!mounted) return 'Light';
    if (colorScheme === 'auto') {
      return 'System';
    }
    return computedColorScheme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <div>
      <Group justify="space-between" align="flex-start" wrap="wrap" mb="md">
        <Group gap="sm">
          <Image src="/images/logo.svg" alt="Kube Ingress Dash logo" width={40} height={40} />
          <Anchor component={Link} href="/" underline="never" c="inherit">
            <h1 className="text-3xl font-bold">Kube Ingress Dash</h1>
          </Anchor>
        </Group>

        <Group gap="xs">
          <Button
            component={Link}
            href="/settings"
            variant="outline"
            size="xs"
            leftSection={<IconSettings size={16} />}
          >
            Settings
          </Button>
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
      <Divider />
    </div>
  );
};
