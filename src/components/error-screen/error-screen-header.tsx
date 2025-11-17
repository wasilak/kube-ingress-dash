import React from 'react';
import Image from 'next/image';
import { Select, Group, Title, Text } from '@mantine/core';

interface ErrorScreenHeaderProps {
  theme: string;
  onThemeChange: (theme: string | null) => void;
}

export const ErrorScreenHeader: React.FC<ErrorScreenHeaderProps> = ({ theme, onThemeChange }) => {
  return (
    <Group justify="space-between" align="flex-start" mb="xl" wrap="wrap">
      <Group gap="sm">
        <Image src="/images/logo.svg" alt="kube-ingress-dash logo" width={40} height={40} />
        <Title order={1} size="h2">
          kube-ingress-dash
        </Title>
      </Group>

      <Group gap="sm">
        <Text size="sm" fw={500}>
          Theme:
        </Text>
        <Select
          value={theme}
          onChange={onThemeChange}
          data={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'auto', label: 'System' },
          ]}
          style={{ width: 120 }}
        />
      </Group>
    </Group>
  );
};
