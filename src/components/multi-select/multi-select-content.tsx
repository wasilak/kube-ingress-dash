import React from 'react';
import { TextInput, Divider, ScrollArea, Stack, Group, Text } from '@mantine/core';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MultiSelectOption, MultiSelectGroup } from './types';

interface MultiSelectContentProps {
  searchable: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  emptyIndicator?: React.ReactNode;
  hideSelectAll: boolean;
  allOptionsSelected: boolean;
  onToggleAll: () => void;
  getAllOptions: () => MultiSelectOption[];
  filteredOptions: (MultiSelectOption | MultiSelectGroup)[];
  selectedValues: string[];
  onToggleOption: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const MultiSelectContent: React.FC<MultiSelectContentProps> = ({
  searchable,
  query,
  onQueryChange,
  onInputKeyDown,
  emptyIndicator,
  hideSelectAll,
  allOptionsSelected,
  onToggleAll,
  getAllOptions,
  filteredOptions,
  selectedValues,
  onToggleOption,
  onClear,
  onClose,
}) => {
  const isGroupedOptions = (
    opts: (MultiSelectOption | MultiSelectGroup)[]
  ): opts is MultiSelectGroup[] => {
    return opts.length > 0 && 'heading' in opts[0];
  };

  return (
    <Stack gap={0} className="w-full">
      {searchable && (
        <div className="p-2">
          <TextInput
            placeholder="Search options..."
            value={query}
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            onKeyDown={onInputKeyDown}
          />
        </div>
      )}
      <ScrollArea.Autosize mah={300} type="auto">
        <Stack gap="xs" p="xs">
          {filteredOptions.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="md">
              {emptyIndicator || 'No results found.'}
            </Text>
          )}
          {!hideSelectAll && !query && filteredOptions.length > 0 && (
            <>
              <div
                key="all"
                onClick={onToggleAll}
                className="cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center"
              >
                <div
                  className={cn(
                    'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                    allOptionsSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible'
                  )}
                >
                  <Check className="h-4 w-4" />
                </div>
                <span>
                  (Select All
                  {getAllOptions().length > 20 ? ` - ${getAllOptions().length} options` : ''})
                </span>
              </div>
              <Divider />
            </>
          )}
          {isGroupedOptions(filteredOptions)
            ? filteredOptions.map((group) => (
                <div key={group.heading}>
                  <Text size="xs" fw={500} c="dimmed" px="xs" py={4}>
                    {group.heading}
                  </Text>
                  {group.options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <div
                        key={option.value}
                        onClick={() => !option.disabled && onToggleOption(option.value)}
                        className={cn(
                          'cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center',
                          option.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                        <span>{option.label}</span>
                      </div>
                    );
                  })}
                </div>
              ))
            : (filteredOptions as MultiSelectOption[]).map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => !option.disabled && onToggleOption(option.value)}
                    className={cn(
                      'cursor-pointer px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-center',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {option.icon && <option.icon className="mr-2 h-4 w-4" />}
                    <span>{option.label}</span>
                  </div>
                );
              })}
        </Stack>
      </ScrollArea.Autosize>
      <Divider />
      <Group grow p="xs">
        {selectedValues.length > 0 && (
          <>
            <div
              onClick={onClear}
              className="cursor-pointer text-center py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              Clear
            </div>
            <Divider orientation="vertical" />
          </>
        )}
        <div
          onClick={onClose}
          className="cursor-pointer text-center py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          Close
        </div>
      </Group>
    </Stack>
  );
};
