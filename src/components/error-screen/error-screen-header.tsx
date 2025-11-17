import React from 'react';
import Image from 'next/image';
import { Select } from '@mantine/core';

interface ErrorScreenHeaderProps {
  theme: string;
  onThemeChange: (theme: string | null) => void;
}

export const ErrorScreenHeader: React.FC<ErrorScreenHeaderProps> = ({ theme, onThemeChange }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
      <div className="flex items-center gap-2">
        <div>
          <Image
            src="/images/logo.svg"
            alt="kube-ingress-dash logo"
            width={40}
            height={40}
            className="text-muted-foreground"
          />
        </div>
        <h1 className="text-3xl font-bold">kube-ingress-dash</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="theme-select" className="text-sm font-medium">
            Theme:
          </label>
          <Select
            id="theme-select"
            value={theme}
            onChange={onThemeChange}
            data={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
            className="w-[120px]"
          />
        </div>
      </div>
    </div>
  );
};
