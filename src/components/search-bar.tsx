'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  value?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = 'Search ingresses...', 
  className = '',
  value = ''
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch(value);
  };

  const clearSearch = () => {
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Search className="h-4 w-4" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        className="pl-10 pr-10 w-full"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default SearchBar;