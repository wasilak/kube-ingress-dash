import * as React from 'react';
import { MultiSelectComponent } from './multi-select-component';
import { MultiSelectProps, MultiSelectOption, MultiSelectGroup } from './types';

/**
 * Memoized MultiSelect component with custom comparison function.
 * Only re-renders when options, defaultValue, or configuration props change.
 * Uses deep comparison for options and defaultValue arrays.
 */
const MultiSelect = React.memo(MultiSelectComponent, (prevProps, nextProps) => {
  // Compare primitive props
  if (
    prevProps.placeholder !== nextProps.placeholder ||
    prevProps.variant !== nextProps.variant ||
    prevProps.maxCount !== nextProps.maxCount ||
    prevProps.modalPopover !== nextProps.modalPopover ||
    prevProps.searchable !== nextProps.searchable ||
    prevProps.disabled !== nextProps.disabled ||
    prevProps.responsive !== nextProps.responsive ||
    prevProps.closeOnSelect !== nextProps.closeOnSelect ||
    prevProps.hideSelectAll !== nextProps.hideSelectAll
  ) {
    return false;
  }

  // Compare callback references
  if (prevProps.onValueChange !== nextProps.onValueChange) {
    return false;
  }

  // Compare defaultValue array
  if (prevProps.defaultValue?.length !== nextProps.defaultValue?.length) {
    return false;
  }

  if (prevProps.defaultValue && nextProps.defaultValue) {
    for (let i = 0; i < prevProps.defaultValue.length; i++) {
      if (prevProps.defaultValue[i] !== nextProps.defaultValue[i]) {
        return false;
      }
    }
  }

  // Compare options array
  if (prevProps.options.length !== nextProps.options.length) {
    return false;
  }

  if (prevProps.options === nextProps.options) {
    return true;
  }

  // Deep comparison of options structure
  for (let i = 0; i < prevProps.options.length; i++) {
    const prevOption = prevProps.options[i];
    const nextOption = nextProps.options[i];

    if ('heading' in prevOption && 'heading' in nextOption) {
      if (
        prevOption.heading !== nextOption.heading ||
        prevOption.options.length !== nextOption.options.length
      ) {
        return false;
      }

      for (let j = 0; j < prevOption.options.length; j++) {
        if (
          prevOption.options[j].value !== nextOption.options[j].value ||
          prevOption.options[j].label !== nextOption.options[j].label
        ) {
          return false;
        }
      }
    } else if ('value' in prevOption && 'value' in nextOption) {
      if (prevOption.value !== nextOption.value || prevOption.label !== nextOption.label) {
        return false;
      }
    } else {
      return false;
    }
  }

  if (prevProps.emptyIndicator !== nextProps.emptyIndicator) {
    return false;
  }

  return true;
});

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect, type MultiSelectOption, type MultiSelectGroup, type MultiSelectProps };
