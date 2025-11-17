import * as React from 'react';
import { MultiSelect as MantineMultiSelect } from '@mantine/core';
import { MultiSelectOption } from './types';

export interface MultiSelectProps {
  options: MultiSelectOption[];
  onValueChange: (values: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  disabled?: boolean;
  maxCount?: number;
  hideSelectAll?: boolean;
}

/**
 * Wrapper around Mantine's MultiSelect component to match our API
 */
export const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(
  (
    {
      options,
      onValueChange,
      defaultValue = [],
      placeholder,
      disabled,
      maxCount: _maxCount,
      hideSelectAll: _hideSelectAll,
    },
    ref
  ) => {
    const [value, setValue] = React.useState<string[]>(defaultValue);

    // Convert our options format to Mantine's format
    const mantineData = options.map((opt) => ({
      value: opt.value,
      label: opt.label,
    }));

    const handleChange = (newValue: string[]) => {
      setValue(newValue);
      onValueChange(newValue);
    };

    return (
      <MantineMultiSelect
        ref={ref}
        data={mantineData}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        searchable
        clearable
      />
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export { type MultiSelectOption };
