'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSettings, saveSettings, type FilterSettings } from '@/lib/settings-storage';

interface SettingsContextValue {
  settings: FilterSettings;
  updateSettings: (settings: FilterSettings) => void;
  updateSetting: <K extends keyof FilterSettings>(key: K, value: FilterSettings[K]) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<FilterSettings>({
    excludedLabels: [],
    excludedNamespaces: [],
    excludedAnnotations: [],
  });

  // Load settings on mount
  useEffect(() => {
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
  }, []);

  // Listen for storage events (changes from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kube-ingress-dash-settings') {
        const loadedSettings = getSettings();
        setSettings(loadedSettings);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSettings = useCallback((newSettings: FilterSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('settings-changed', { detail: newSettings }));
  }, []);

  const updateSetting = useCallback(
    <K extends keyof FilterSettings>(key: K, value: FilterSettings[K]) => {
      const newSettings = {
        ...settings,
        [key]: value,
      };
      updateSettings(newSettings);
    },
    [settings, updateSettings]
  );

  const resetSettings = useCallback(() => {
    const defaultSettings: FilterSettings = {
      excludedLabels: [],
      excludedNamespaces: [],
      excludedAnnotations: [],
    };
    updateSettings(defaultSettings);
  }, [updateSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateSetting,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
