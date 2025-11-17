import React from 'react';
import { MultiSelect, Group } from '@mantine/core';
import { Layers } from 'lucide-react';

export interface NamespaceFilterProps {
  namespaces: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  namespaceCounts?: Record<string, number>;
}

const NamespaceFilter: React.FC<NamespaceFilterProps> = ({
  namespaces,
  selected,
  onChange,
  namespaceCounts = {},
}) => {
  // Add "All" option to the beginning with proper value/label separation
  const totalCount = Object.values(namespaceCounts).reduce((sum, count) => sum + count, 0);
  const options = [
    { value: 'All', label: totalCount > 0 ? `All (${totalCount})` : 'All' },
    ...namespaces.map((ns) => ({
      value: ns,
      label: namespaceCounts[ns] ? `${ns} (${namespaceCounts[ns]})` : ns,
    })),
  ];

  // Check if "All" is selected
  const isAllSelected = selected.length === 1 && selected[0] === 'All';

  const handleValueChange = (values: string[]) => {
    if (values.includes('All')) {
      // If "All" is selected along with other values, just select "All"
      onChange(['All']);
    } else {
      // Remove "All" if other options are selected
      onChange(values);
    }
  };

  return (
    <Group gap="xs" wrap="nowrap" aria-label="Namespace Filter">
      <Layers className="h-4 w-4 flex-shrink-0" />
      <MultiSelect
        data={options}
        value={selected}
        onChange={handleValueChange}
        placeholder={isAllSelected ? 'All namespaces' : 'Select namespaces'}
        searchable
        clearable
        hidePickedOptions={false}
        styles={{
          root: {
            width: 250,
          },
          input: {
            minHeight: 'auto',
          },
        }}
      />
    </Group>
  );
};

export { NamespaceFilter };
