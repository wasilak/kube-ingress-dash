'use client';

import { ActionIcon } from '@mantine/core';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { Sun, Moon, Monitor } from 'lucide-react';

/**
 * Theme toggle component using Mantine's native color scheme management
 * Cycles through: light -> dark -> auto (system)
 * @see https://mantine.dev/theming/color-schemes/
 */
export function ThemeToggle() {
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

  const getIcon = () => {
    if (colorScheme === 'auto') {
      return <Monitor className="h-5 w-5" />;
    }
    return computedColorScheme === 'dark' ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
    );
  };

  const getLabel = () => {
    if (colorScheme === 'auto') {
      return 'System mode';
    }
    return computedColorScheme === 'dark' ? 'Dark mode' : 'Light mode';
  };

  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      onClick={cycleTheme}
      title={getLabel()}
      aria-label={getLabel()}
    >
      {getIcon()}
    </ActionIcon>
  );
}
