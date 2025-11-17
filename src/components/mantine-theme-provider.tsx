'use client';

import { MantineProvider } from '@mantine/core';
import { mantineTheme } from '@/theme/mantine-theme';

/**
 * Mantine theme provider using native Mantine color scheme management
 * @see https://mantine.dev/theming/color-schemes/
 */
export function MantineThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
      {children}
    </MantineProvider>
  );
}
