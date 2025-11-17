'use client';

import { MantineProvider, useMantineColorScheme } from '@mantine/core';
import { useEffect } from 'react';
import { mantineTheme } from '@/theme/mantine-theme';
import { useTheme } from '@/components/theme-provider';

function MantineColorSchemeSync() {
  const { theme } = useTheme();
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setColorScheme(isDark ? 'dark' : 'light');
    } else {
      setColorScheme(theme);
    }
  }, [theme, setColorScheme]);

  return null;
}

export function MantineThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
      <MantineColorSchemeSync />
      {children}
    </MantineProvider>
  );
}
