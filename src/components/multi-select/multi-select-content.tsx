import React from 'react';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  CommandEmpty,
  CommandSeparator,
} from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';
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
    <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
      {searchable && (
        <CommandInput
          placeholder="Search options..."
          value={query}
          onValueChange={onQueryChange}
          onKeyDown={onInputKeyDown}
        />
      )}
      <CommandList>
        <CommandEmpty>{emptyIndicator || 'No results found.'}</CommandEmpty>
        {!hideSelectAll && !query && (
          <CommandGroup>
            <CommandItem key="all" onSelect={onToggleAll} className="cursor-pointer">
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
            </CommandItem>
          </CommandGroup>
        )}
        {isGroupedOptions(filteredOptions) ? (
          filteredOptions.map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onToggleOption(option.value)}
                    className={cn(
                      'cursor-pointer',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    disabled={option.disabled}
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
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))
        ) : (
          <CommandGroup>
            {(filteredOptions as MultiSelectOption[]).map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => onToggleOption(option.value)}
                  className={cn(
                    'cursor-pointer',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  disabled={option.disabled}
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
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
        <CommandSeparator />
        <CommandGroup>
          <div className="flex items-center justify-between">
            {selectedValues.length > 0 && (
              <>
                <CommandItem onSelect={onClear} className="flex-1 justify-center cursor-pointer">
                  Clear
                </CommandItem>
                <Separator orientation="vertical" className="flex min-h-6 h-full" />
              </>
            )}
            <CommandItem
              onSelect={onClose}
              className="flex-1 justify-center cursor-pointer max-w-full"
            >
              Close
            </CommandItem>
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
