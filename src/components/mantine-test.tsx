'use client';

import { Button, Card, Badge, TextInput, Stack, Group, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

/**
 * Test component to verify Mantine setup and styling
 * This component can be removed after migration is complete
 */
export function MantineTest() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text size="xl" fw={700}>
          Mantine Setup Test
        </Text>

        <Group>
          <Button variant="filled" leftSection={<IconCheck size={16} />}>
            Primary Button
          </Button>
          <Button variant="light">Light Button</Button>
          <Button variant="outline">Outline Button</Button>
        </Group>

        <Group>
          <Badge color="blue">Blue Badge</Badge>
          <Badge color="green">Green Badge</Badge>
          <Badge color="red">Red Badge</Badge>
        </Group>

        <TextInput
          label="Test Input"
          placeholder="Enter text here"
          description="This is a test input field"
        />

        <Text size="sm" c="dimmed">
          If you can see this card with styled components, Mantine is working correctly!
        </Text>
      </Stack>
    </Card>
  );
}
