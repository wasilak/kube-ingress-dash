'use client';

import * as React from 'react';
import { Command, CommandGroup, CommandItem, CommandList, CommandInput, CommandEmpty, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Check, ChevronsUpDown } from 'lucide-react';

type MultiSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  style?: {
    badgeColor?: string;
    iconColor?: string;
    gradient?: string;
  };
};

type MultiSelectGroup = {
  heading: string;
  options: MultiSelectOption[];
};

type MultiSelectProps = {
  options: (MultiSelectOption | MultiSelectGroup)[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  maxCount?: number;
  modalPopover?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  responsive?: boolean;
  closeOnSelect?: boolean;
  hideSelectAll?: boolean;
  emptyIndicator?: React.ReactNode;
};

const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      defaultValue = [],
      placeholder = 'Select options',
      variant = 'default',
      maxCount = 3,
      modalPopover = false,
      searchable = true,
      disabled = false,
      responsive: _responsive = false,
      closeOnSelect = false,
      hideSelectAll = false,
      emptyIndicator,
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const prevDefaultValueRef = React.useRef<string[]>(defaultValue);
    const selectedValuesRef = React.useRef<string[]>(defaultValue);
    const isInternalUpdateRef = React.useRef(false);

    // Keep ref in sync with state
    React.useEffect(() => {
      selectedValuesRef.current = selectedValues;
    }, [selectedValues]);

    // Sync internal state with defaultValue prop changes (only when it changes externally)
    React.useEffect(() => {
      // Skip if this update came from our own internal state change
      if (isInternalUpdateRef.current) {
        isInternalUpdateRef.current = false;
        // Update the ref to track the new defaultValue
        prevDefaultValueRef.current = [...defaultValue];
        return;
      }
      
      const arraysEqual = (a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        return a.every((val, idx) => val === b[idx]);
      };
      
      // Only sync if defaultValue actually changed from the previous value
      if (!arraysEqual(defaultValue, prevDefaultValueRef.current)) {
        // Only update if the new defaultValue is actually different from current state
        if (!arraysEqual(defaultValue, selectedValuesRef.current)) {
          setSelectedValues([...defaultValue]);
        }
        prevDefaultValueRef.current = [...defaultValue];
      }
    }, [defaultValue]);

    // Get all options (flattened)
    const getAllOptions = React.useCallback((): MultiSelectOption[] => {
      const flatOptions: MultiSelectOption[] = [];
      options.forEach(option => {
        if ('options' in option) {
          option.options.forEach(item => flatOptions.push(item));
        } else {
          flatOptions.push(option);
        }
      });
      return flatOptions;
    }, [options]);

    // Get option by value
    const getOptionByValue = React.useCallback(
      (value: string): MultiSelectOption | undefined => {
        return getAllOptions().find((option) => option.value === value);
      },
      [getAllOptions]
    );

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setIsPopoverOpen(true);
      } else if (e.key === 'Backspace' && !query) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        isInternalUpdateRef.current = true;
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const removeSelectedValue = (value: string) => {
      const newValues = selectedValues.filter((v) => v !== value);
      isInternalUpdateRef.current = true;
      setSelectedValues(newValues);
      onValueChange(newValues);
    };

    const toggleOption = (value: string) => {
      let newValues: string[];
      if (selectedValues.includes(value)) {
        newValues = selectedValues.filter((v) => v !== value);
      } else {
        newValues = [...selectedValues, value];
      }
      isInternalUpdateRef.current = true;
      setSelectedValues(newValues);
      onValueChange(newValues);
      if (closeOnSelect) {
        setIsPopoverOpen(false);
      }
    };

    const handleClear = () => {
      isInternalUpdateRef.current = true;
      setSelectedValues([]);
      onValueChange([]);
    };

    const toggleAll = () => {
      const allOptions = getAllOptions().filter((option) => !option.disabled);
      let newValues: string[];
      if (selectedValues.length === allOptions.length) {
        newValues = [];
      } else {
        newValues = allOptions.map((option) => option.value);
      }
      isInternalUpdateRef.current = true;
      setSelectedValues(newValues);
      onValueChange(newValues);
      if (closeOnSelect) {
        setIsPopoverOpen(false);
      }
    };

    // Filter options based on search query
    const filteredOptions = React.useMemo((): (MultiSelectOption | MultiSelectGroup)[] => {
      if (!searchable || !query) return options;

      if (options.length === 0) return [];

      const isGrouped = options.length > 0 && 'heading' in options[0];

      if (isGrouped) {
        return (options as MultiSelectGroup[]).map((group) => ({
          ...group,
          options: group.options.filter(
            (option) =>
              option.label.toLowerCase().includes(query.toLowerCase()) ||
              option.value.toLowerCase().includes(query.toLowerCase())
          ),
        })).filter((group) => group.options.length > 0) as MultiSelectGroup[];
      }

      return (options as MultiSelectOption[]).filter(
        (option) =>
          option.label.toLowerCase().includes(query.toLowerCase()) ||
          option.value.toLowerCase().includes(query.toLowerCase())
      ) as MultiSelectOption[];
    }, [options, query, searchable]);

    // Check if all options are selected
    const allOptionsSelected = React.useMemo(() => {
      const allOptions = getAllOptions().filter((opt) => !opt.disabled);
      return selectedValues.length === allOptions.length && allOptions.length > 0;
    }, [selectedValues, getAllOptions]);

    React.useEffect(() => {
      if (!isPopoverOpen) {
        setQuery('');
      }
    }, [isPopoverOpen]);

    const isGroupedOptions = (opts: (MultiSelectOption | MultiSelectGroup)[]): opts is MultiSelectGroup[] => {
      return opts.length > 0 && 'heading' in opts[0];
    };

    return (
      <div className={cn('flex w-full flex-col gap-2')}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
          <PopoverTrigger asChild disabled={disabled}>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={isPopoverOpen}
              className={cn(
                'w-full justify-between bg-background text-sm font-normal px-3 py-2 h-auto min-h-10',
                'flex items-center gap-2'
              )}
            >
              <div className="flex flex-1 items-center gap-1 flex-wrap min-h-[24px]">
                {selectedValues.length > 0 ? (
                  <>
                    {selectedValues.slice(0, maxCount).map((value) => {
                      const option = getOptionByValue(value);
                      if (!option) return null;

                      return (
                        <Badge
                          key={value}
                          className={cn(
                            'data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground',
                            'data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground',
                            option.style?.gradient ? `bg-gradient-to-r ${option.style.gradient}` : ''
                          )}
                          style={{
                            backgroundColor: option.style?.badgeColor,
                            color: option.style?.iconColor,
                          }}
                          variant={variant}
                          data-disabled={option.disabled}
                        >
                          {option.icon && (
                            <span style={{ color: option.style?.iconColor }}>
                              <option.icon className="mr-2 h-3 w-3" />
                            </span>
                          )}
                          {option.label}
                          <X
                            className="ml-1 h-3 w-3 hover:text-foreground cursor-pointer"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeSelectedValue(value);
                            }}
                          />
                        </Badge>
                      );
                    })}
                    {selectedValues.length > maxCount && (
                      <Badge variant={variant} className="bg-transparent text-foreground border-foreground/10 hover:bg-transparent">
                        +{selectedValues.length - maxCount} more
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground text-left">{placeholder}</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {selectedValues.length > 0 && (
                  <X
                    className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                )}
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              'w-full p-0',
              modalPopover ? 'mt-0 rounded-t-none border-t-0' : 'mt-0'
            )}
            align="start"
          >
            <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
              {searchable && (
                <CommandInput
                  placeholder="Search options..."
                  value={query}
                  onValueChange={setQuery}
                  onKeyDown={handleInputKeyDown}
                />
              )}
              <CommandList>
                <CommandEmpty>
                  {emptyIndicator || 'No results found.'}
                </CommandEmpty>
                {!hideSelectAll && !query && (
                  <CommandGroup>
                    <CommandItem
                      key="all"
                      onSelect={toggleAll}
                      className="cursor-pointer"
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
                        (Select All{getAllOptions().length > 20 ? ` - ${getAllOptions().length} options` : ''})
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
                            onSelect={() => toggleOption(option.value)}
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
                            {option.icon && (
                              <option.icon className="mr-2 h-4 w-4" />
                            )}
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
                          onSelect={() => toggleOption(option.value)}
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
                          {option.icon && (
                            <option.icon className="mr-2 h-4 w-4" />
                          )}
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
                        <CommandItem
                          onSelect={handleClear}
                          className="flex-1 justify-center cursor-pointer"
                        >
                          Clear
                        </CommandItem>
                        <Separator
                          orientation="vertical"
                          className="flex min-h-6 h-full"
                        />
                      </>
                    )}
                    <CommandItem
                      onSelect={() => setIsPopoverOpen(false)}
                      className="flex-1 justify-center cursor-pointer max-w-full"
                    >
                      Close
                    </CommandItem>
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect, type MultiSelectOption, type MultiSelectGroup };
