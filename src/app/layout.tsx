import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ThemeProvider } from '@/components/theme-provider';
import ErrorBoundary from '@/components/error-boundary';
import { mantineTheme } from '@/theme/mantine-theme';

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
        <ColorSchemeScript />
        <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <MantineProvider theme={mantineTheme}>
              <Notifications position="top-right" />
              {children}
            </MantineProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
