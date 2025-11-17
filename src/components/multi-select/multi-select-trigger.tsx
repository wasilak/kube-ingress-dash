import React from 'react';
import { Button, Badge } from '@mantine/core';
import { X, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MultiSelectOption } from './types';

interface MultiSelectTriggerProps {
  selectedValues: string[];
  maxCount: number;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  placeholder: string;
  disabled: boolean;
  isOpen: boolean;
  getOptionByValue: (value: string) => MultiSelectOption | undefined;
  onRemoveValue: (value: string) => void;
  onClear: () => void;
  onClick?: () => void;
}

export const MultiSelectTrigger = React.forwardRef<HTMLButtonElement, MultiSelectTriggerProps>(
  (
    {
      selectedValues,
      maxCount,
      variant,
      placeholder,
      disabled,
      isOpen,
      getOptionByValue,
      onRemoveValue,
      onClear,
      onClick,
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={onClick}
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
                    variant={variant === 'outline' ? 'outline' : 'light'}
                    data-disabled={option.disabled}
                    leftSection={
                      option.icon && (
                        <span style={{ color: option.style?.iconColor }}>
                          <option.icon className="h-3 w-3" />
                        </span>
                      )
                    }
                    rightSection={
                      <X
                        className="h-3 w-3 hover:text-foreground cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveValue(value);
                        }}
                      />
                    }
                  >
                    {option.label}
                  </Badge>
                );
              })}
              {selectedValues.length > maxCount && (
                <Badge
                  variant="outline"
                  className="bg-transparent text-foreground border-foreground/10 hover:bg-transparent"
                >
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
                onClear();
              }}
            />
          )}
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </Button>
    );
  }
);

MultiSelectTrigger.displayName = 'MultiSelectTrigger';
