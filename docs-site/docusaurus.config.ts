import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { exit } from 'process';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const config: Config = {
  title: 'kube-ingress-dash',
  tagline: 'Kubernetes Ingress Dashboard for monitoring and navigating services running in Kubernetes clusters. Real-time visibility into ingress resources, making it easy to discover, access, and monitor services.',
  favicon: 'img/logo.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://wasilak.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'wasilak', // Usually your GitHub org/user name.
  projectName: 'kube-ingress-dash', // Usually your repo name.
  baseUrl: '/kube-ingress-dash/',
  onBrokenLinks: 'throw',
  trailingSlash: false,

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          routeBasePath: '/', // Serve docs at site root
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        blog: false, // Disable blog
      } satisfies Preset.Options,
    ],
  ],



  plugins: [
  ],
  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
    preprocessor: ({ filePath, fileContent }) => {
      const helmVersion = process.env.HELM_VERSION || 'local';
      const dockerVersion = process.env.DOCKER_VERSION || 'local';
      return fileContent
        .replaceAll('@HELM_VERSION@', helmVersion)
        .replaceAll('@DOCKER_VERSION@', dockerVersion);
    },
  },
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'kube-ingress-dash',
      logo: {
        alt: 'kube-ingress-dash Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'sidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/wasilak/kube-ingress-dash',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/wasilak/kube-ingress-dash',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} kube-ingress-dash. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {
      theme: { light: 'default', dark: 'dark' },
      options: {
        securityLevel: 'loose',
      },
    },
  },
};

export default config;
