import { MantineThemeOverride } from '@mantine/core';

/**
 * Mantine theme configuration matching the existing design tokens
 * from globals.css and Tailwind configuration
 */
export const mantineTheme: MantineThemeOverride = {
  // Use Inter font to match existing design
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  // Primary color mapping to indigo theme (hsl(239, 84%, 67%))
  primaryColor: 'indigo',

  // Border radius matching --radius: 0.5rem
  defaultRadius: 'md',

  // Color scheme
  colors: {
    // Indigo scale matching the primary color
    indigo: [
      '#eef2ff', // 50
      '#e0e7ff', // 100
      '#c7d2fe', // 200
      '#a5b4fc', // 300
      '#818cf8', // 400
      '#6366f1', // 500 - primary
      '#4f46e5', // 600
      '#4338ca', // 700
      '#3730a3', // 800
      '#312e81', // 900
    ],
  },

  // Spacing scale (Mantine uses rem by default, matching Tailwind)
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },

  // Breakpoints matching common responsive design
  breakpoints: {
    xs: '30em', // 480px
    sm: '48em', // 768px
    md: '64em', // 1024px
    lg: '74em', // 1184px
    xl: '90em', // 1440px
  },

  // Component-specific overrides
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'none',
        withBorder: true,
        padding: 'md',
      },
      styles: {
        root: {
          backgroundColor: 'transparent',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          '&:hover': {
            borderColor: 'hsl(var(--primary))',
          },
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        centered: true,
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'transparent',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          '&:hover': {
            borderColor: 'hsl(var(--primary))',
          },
          '&:focus': {
            borderColor: 'hsl(var(--primary))',
          },
          '&::placeholder': {
            color: 'hsl(var(--muted-foreground))',
          },
        },
      },
    },
    MultiSelect: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'transparent',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          '&:hover': {
            borderColor: 'hsl(var(--primary))',
          },
          '&:focus': {
            borderColor: 'hsl(var(--primary))',
          },
          '&::placeholder': {
            color: 'hsl(var(--muted-foreground))',
          },
        },
        pill: {
          backgroundColor: 'hsl(var(--accent))',
          color: 'hsl(var(--foreground))',
        },
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'transparent',
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--foreground))',
          '&:hover': {
            borderColor: 'hsl(var(--primary))',
          },
          '&:focus': {
            borderColor: 'hsl(var(--primary))',
          },
          '&::placeholder': {
            color: 'hsl(var(--muted-foreground))',
          },
        },
      },
    },
    ActionIcon: {
      styles: {
        root: {
          '&:hover': {
            borderColor: 'hsl(239 84% 67%)',
            backgroundColor: 'transparent',
          },
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
      },
    },
  },

  // Other theme properties
  other: {
    // Custom properties that can be accessed via theme.other
    transitionDuration: '150ms',
  },
};
