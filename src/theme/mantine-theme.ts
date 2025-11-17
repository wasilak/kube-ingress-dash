import { createTheme, MantineColorsTuple } from '@mantine/core';

/**
 * Indigo color palette matching the design system
 * Based on --primary: 239 84% 67% (hsl(239, 84%, 67%) = #818cf8)
 */
const indigo: MantineColorsTuple = [
  '#eef2ff', // 50 - lightest
  '#e0e7ff', // 100
  '#c7d2fe', // 200
  '#a5b4fc', // 300
  '#818cf8', // 400
  '#6366f1', // 500 - base
  '#4f46e5', // 600 - primary (matches hsl(239, 84%, 67%))
  '#4338ca', // 700
  '#3730a3', // 800
  '#312e81', // 900 - darkest
];

/**
 * Mantine theme configuration
 * Follows Mantine's recommended approach for color schemes and theming
 * @see https://mantine.dev/theming/color-schemes/
 * @see https://mantine.dev/theming/colors/
 */
export const mantineTheme = createTheme({
  // Use Inter font to match existing design
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  // Primary color - indigo theme
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 6 },

  // Border radius matching --radius: 0.5rem
  defaultRadius: 'md',

  // Custom color palette
  colors: {
    indigo,
  },

  // Spacing scale (Mantine uses rem by default)
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },

  // Breakpoints matching responsive design
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
        shadow: 'sm',
        withBorder: true,
        padding: 'md',
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
    },
    MultiSelect: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
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
    transitionDuration: '150ms',
  },
});
