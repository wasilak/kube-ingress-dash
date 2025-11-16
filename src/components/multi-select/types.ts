import React from 'react';

export type MultiSelectOption = {
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

export type MultiSelectGroup = {
  heading: string;
  options: MultiSelectOption[];
};

export type MultiSelectProps = {
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
