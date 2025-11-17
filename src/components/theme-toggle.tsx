'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { ActionIcon } from '@mantine/core';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System mode';
      default:
        return 'System mode';
    }
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
