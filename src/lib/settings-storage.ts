/**
 * Settings storage utilities for managing filter exclusions in localStorage
 */

export interface FilterSettings {
  excludedLabels: string[];
  excludedNamespaces: string[];
  excludedAnnotations: string[];
}

const SETTINGS_KEY = 'kube-ingress-dash-settings';

const DEFAULT_SETTINGS: FilterSettings = {
  excludedLabels: [],
  excludedNamespaces: [],
  excludedAnnotations: [],
};

/**
 * Get settings from localStorage
 * Returns default settings if none exist or if there's an error
 */
export function getSettings(): FilterSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored) as FilterSettings;

    // Validate structure
    if (
      typeof parsed === 'object' &&
      Array.isArray(parsed.excludedLabels) &&
      Array.isArray(parsed.excludedNamespaces) &&
      Array.isArray(parsed.excludedAnnotations)
    ) {
      return parsed;
    }

    console.warn('Invalid settings structure, using defaults');
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 * Returns true if successful, false otherwise
 */
export function saveSettings(settings: FilterSettings): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const serialized = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
    return false;
  }
}

/**
 * Update a specific setting field
 */
export function updateSetting<K extends keyof FilterSettings>(
  key: K,
  value: FilterSettings[K]
): boolean {
  const currentSettings = getSettings();
  const updatedSettings = {
    ...currentSettings,
    [key]: value,
  };
  return saveSettings(updatedSettings);
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): boolean {
  return saveSettings(DEFAULT_SETTINGS);
}

/**
 * Clear all settings from localStorage
 */
export function clearSettings(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing settings from localStorage:', error);
    return false;
  }
}
