import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';
import './mantine-overrides.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import ErrorBoundary from '@/components/error-boundary';
import { MantineThemeProvider } from '@/components/mantine-theme-provider';
import { SettingsProvider } from '@/contexts/settings-context';
import { SpotlightProvider } from '@/contexts/spotlight-context';
import { SpotlightProviderWrapper } from '@/components/spotlight-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kubernetes Ingress Dashboard',
  description: 'Real-time monitoring and navigation for Kubernetes ingresses',
  icons: {
    icon: '/images/logo.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <MantineThemeProvider>
            <SettingsProvider>
              <SpotlightProvider>
                <SpotlightProviderWrapper>
                  <Notifications position="top-right" />
                  {children}
                </SpotlightProviderWrapper>
              </SpotlightProvider>
            </SettingsProvider>
          </MantineThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
