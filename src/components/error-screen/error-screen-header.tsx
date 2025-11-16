import React from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ErrorScreenHeaderProps {
  theme: string;
  onThemeChange: (theme: string) => void;
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
          <Label htmlFor="theme-select">Theme:</Label>
          <Select value={theme} onValueChange={onThemeChange}>
            <SelectTrigger id="theme-select" className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
