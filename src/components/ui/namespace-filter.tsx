import React from 'react';
import { MultiSelect, MultiSelectOption } from '../multi-select';
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
  // Add "All" option to the beginning
  const totalCount = Object.values(namespaceCounts).reduce((sum, count) => sum + count, 0);
  const options: MultiSelectOption[] = [
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
    <div aria-label="Namespace Filter" className="flex items-center gap-2">
      <Layers className="h-4 w-4 flex-shrink-0" />
      <MultiSelect
        options={options}
        onValueChange={handleValueChange}
        defaultValue={selected}
        placeholder={isAllSelected ? 'All namespaces' : 'Select namespaces'}
        hideSelectAll={false}
        maxCount={2} // Show up to 2 namespace badges, then show "+X selected"
      />
    </div>
  );
};

export { NamespaceFilter };
