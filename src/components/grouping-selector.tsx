import React from 'react';
import { Select, Stack, Group, Text } from '@mantine/core';
import { FolderTree } from 'lucide-react';
import { GroupingMode } from '@/types/grouping';

interface GroupingSelectorProps {
  value: GroupingMode;
  onChange: (value: GroupingMode) => void;
}

const groupingOptions = [
  { value: 'none', label: 'None' },
  { value: 'namespace', label: 'Namespace' },
  { value: 'tls', label: 'TLS Status' },
];

export const GroupingSelector: React.FC<GroupingSelectorProps> = ({ value, onChange }) => {
  return (
    <Stack gap="xs" pt="xs">
      <Group gap="xs">
        <FolderTree className="h-4 w-4" />
        <Text size="sm" fw={500}>
          Group by
        </Text>
      </Group>
      <Select
        placeholder="Select grouping"
        data={groupingOptions}
        value={value}
        onChange={(val) => onChange(val as GroupingMode)}
        allowDeselect={false}
        styles={{
          root: {
            minWidth: '180px',
          },
        }}
      />
    </Stack>
  );
};
