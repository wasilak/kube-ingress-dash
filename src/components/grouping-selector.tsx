import React from 'react';
import { Select } from '@mantine/core';
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
    <Select
      label="Group by"
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
  );
};
