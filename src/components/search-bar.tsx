'use client';

import React, { memo } from 'react';
import { TextInput, ActionIcon } from '@mantine/core';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search ingresses...',
  className = '',
  value = '',
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch(value);
  };

  const clearSearch = () => {
    onSearch('');
  };

  return (
    <TextInput
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleInputChange}
      className={className}
      leftSection={<Search className="h-4 w-4" />}
      rightSection={
        value ? (
          <ActionIcon
            type="button"
            variant="subtle"
            size="sm"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </ActionIcon>
        ) : null
      }
    />
  );
};

/**
 * Memoized SearchBar component with custom comparison function.
 * Only re-renders when value, placeholder, or className props change.
 * The onSearch callback is compared by reference.
 */
const SearchBar = memo(SearchBarComponent, (prevProps, nextProps) => {
  // Compare all props efficiently
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.className === nextProps.className &&
    prevProps.onSearch === nextProps.onSearch
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
