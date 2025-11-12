'use client';

import * as React from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'dashboard-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  
  React.useEffect(() => {
    // Load theme from localStorage after component mounts
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storageKey]);

  React.useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  React.useEffect(() => {
    const root = window.document.documentElement;
    const updateTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      }
    };

    // Listen for system theme changes when theme is set to 'system'
    if (theme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
    }

    return () => {
      if (theme === 'system') {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateTheme);
      }
    };
  }, [theme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (theme: Theme) => {
        setTheme(theme);
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, theme);
        }
      },
    }),
    [theme, storageKey]
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};