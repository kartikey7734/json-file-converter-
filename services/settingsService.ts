import { Settings } from '../types';

const SETTINGS_KEY = 'workflowConverterSettings_v2';

export const defaultSettings: Settings = {
  provider: 'gemini',
  apiKey: null,
  theme: 'system',
};

export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // This migrates old settings by only picking the keys that still exist.
      return { 
          provider: parsed.provider || defaultSettings.provider,
          apiKey: parsed.apiKey || defaultSettings.apiKey,
          theme: parsed.theme || defaultSettings.theme,
       };
    }
  } catch (e) {
    console.error("Failed to load settings from localStorage", e);
  }
  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings to localStorage", e);
  }
};