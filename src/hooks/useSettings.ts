import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  fontSize: number;
  fontFamily: string;
  syncEnabled: boolean;
  autoSave: boolean;
  defaultCategory: string;
  biometricEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  fontSize: 16,
  fontFamily: 'System',
  syncEnabled: true,
  autoSave: true,
  defaultCategory: 'All',
  biometricEnabled: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving settings');
    }
  };

  const resetSettings = async () => {
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(DEFAULT_SETTINGS));
      setSettings(DEFAULT_SETTINGS);
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while resetting settings');
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
  };
}; 