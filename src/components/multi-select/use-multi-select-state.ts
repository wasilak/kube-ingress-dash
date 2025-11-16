import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MultiSelectOption, MultiSelectGroup } from './types';

interface UseMultiSelectStateOptions {
  options: (MultiSelectOption | MultiSelectGroup)[];
  defaultValue: string[];
  onValueChange: (value: string[]) => void;
  searchable: boolean;
  closeOnSelect: boolean;
}

export function useMultiSelectState({
  options,
  defaultValue,
  onValueChange,
  searchable,
  closeOnSelect,
}: UseMultiSelectStateOptions) {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [query, setQuery] = useState('');
  const prevDefaultValueRef = useRef<string[]>(defaultValue);
  const selectedValuesRef = useRef<string[]>(defaultValue);
  const isInternalUpdateRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    selectedValuesRef.current = selectedValues;
  }, [selectedValues]);

  // Sync internal state with defaultValue prop changes
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      prevDefaultValueRef.current = [...defaultValue];
      return;
    }

    const arraysEqual = (a: string[], b: string[]) => {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => val === b[idx]);
    };

    if (!arraysEqual(defaultValue, prevDefaultValueRef.current)) {
      if (!arraysEqual(defaultValue, selectedValuesRef.current)) {
        setSelectedValues([...defaultValue]);
      }
      prevDefaultValueRef.current = [...defaultValue];
    }
  }, [defaultValue]);

  // Get all options (flattened)
  const getAllOptions = useCallback((): MultiSelectOption[] => {
    const flatOptions: MultiSelectOption[] = [];
    options.forEach((option) => {
      if ('options' in option) {
        option.options.forEach((item) => flatOptions.push(item));
      } else {
        flatOptions.push(option);
      }
    });
    return flatOptions;
  }, [options]);

  // Get option by value
  const getOptionByValue = useCallback(
    (value: string): MultiSelectOption | undefined => {
      return getAllOptions().find((option) => option.value === value);
    },
    [getAllOptions]
  );

  const removeSelectedValue = useCallback(
    (value: string) => {
      const newValues = selectedValues.filter((v) => v !== value);
      isInternalUpdateRef.current = true;
      setSelectedValues(newValues);
      onValueChange(newValues);
    },
    [selectedValues, onValueChange]
  );

  const toggleOption = useCallback(
    (value: string) => {
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
    },
    [selectedValues, onValueChange, closeOnSelect]
  );

  const handleClear = useCallback(() => {
    isInternalUpdateRef.current = true;
    setSelectedValues([]);
    onValueChange([]);
  }, [onValueChange]);

  const toggleAll = useCallback(() => {
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
  }, [getAllOptions, selectedValues, onValueChange, closeOnSelect]);

  // Filter options based on search query
  const filteredOptions = useMemo((): (MultiSelectOption | MultiSelectGroup)[] => {
    if (!searchable || !query) return options;

    if (options.length === 0) return [];

    const isGrouped = options.length > 0 && 'heading' in options[0];

    if (isGrouped) {
      return (options as MultiSelectGroup[])
        .map((group) => ({
          ...group,
          options: group.options.filter(
            (option) =>
              option.label.toLowerCase().includes(query.toLowerCase()) ||
              option.value.toLowerCase().includes(query.toLowerCase())
          ),
        }))
        .filter((group) => group.options.length > 0) as MultiSelectGroup[];
    }

    return (options as MultiSelectOption[]).filter(
      (option) =>
        option.label.toLowerCase().includes(query.toLowerCase()) ||
        option.value.toLowerCase().includes(query.toLowerCase())
    ) as MultiSelectOption[];
  }, [options, query, searchable]);

  // Check if all options are selected
  const allOptionsSelected = useMemo(() => {
    const allOptions = getAllOptions().filter((opt) => !opt.disabled);
    return selectedValues.length === allOptions.length && allOptions.length > 0;
  }, [selectedValues, getAllOptions]);

  useEffect(() => {
    if (!isPopoverOpen) {
      setQuery('');
    }
  }, [isPopoverOpen]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setIsPopoverOpen(true);
      } else if (e.key === 'Backspace' && !query) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        isInternalUpdateRef.current = true;
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    },
    [query, selectedValues, onValueChange]
  );

  return {
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
  };
}
