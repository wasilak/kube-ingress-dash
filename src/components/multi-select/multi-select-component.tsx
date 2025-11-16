import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { MultiSelectProps } from './types';
import { useMultiSelectState } from './use-multi-select-state';
import { MultiSelectTrigger } from './multi-select-trigger';
import { MultiSelectContent } from './multi-select-content';

const MultiSelectComponent = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
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
    const {
      selectedValues,
      isPopoverOpen,
      setIsPopoverOpen,
      query,
      setQuery,
      getAllOptions,
      getOptionByValue,
      removeSelectedValue,
      toggleOption,
      handleClear,
      toggleAll,
      filteredOptions,
      allOptionsSelected,
      handleInputKeyDown,
    } = useMultiSelectState({
      options,
      defaultValue,
      onValueChange,
      searchable,
      closeOnSelect,
    });

    return (
      <div className={cn('flex w-full flex-col gap-2')}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
          <PopoverTrigger asChild disabled={disabled}>
            <MultiSelectTrigger
              ref={ref}
              selectedValues={selectedValues}
              maxCount={maxCount}
              variant={variant}
              placeholder={placeholder}
              disabled={disabled}
              isOpen={isPopoverOpen}
              getOptionByValue={getOptionByValue}
              onRemoveValue={removeSelectedValue}
              onClear={handleClear}
            />
          </PopoverTrigger>
          <PopoverContent
            className={cn('w-full p-0', modalPopover ? 'mt-0 rounded-t-none border-t-0' : 'mt-0')}
            align="start"
          >
            <MultiSelectContent
              searchable={searchable}
              query={query}
              onQueryChange={setQuery}
              onInputKeyDown={handleInputKeyDown}
              emptyIndicator={emptyIndicator}
              hideSelectAll={hideSelectAll}
              allOptionsSelected={allOptionsSelected}
              onToggleAll={toggleAll}
              getAllOptions={getAllOptions}
              filteredOptions={filteredOptions}
              selectedValues={selectedValues}
              onToggleOption={toggleOption}
              onClear={handleClear}
              onClose={() => setIsPopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

MultiSelectComponent.displayName = 'MultiSelectComponent';

export { MultiSelectComponent };
