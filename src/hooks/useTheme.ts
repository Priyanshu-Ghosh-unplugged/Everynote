import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: typeof COLORS;
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>({
    mode: 'light',
    colors: COLORS,
  });

  useEffect(() => {
    // Load saved theme preference
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(JSON.parse(savedTheme));
      }
    } catch (err) {
      console.error('Error loading theme preference:', err);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode: ThemeMode = theme.mode === 'light' ? 'dark' : 'light';
      const newTheme: Theme = {
        mode: newMode,
        colors: COLORS,
      };

      await AsyncStorage.setItem('theme', JSON.stringify(newTheme));
      setTheme(newTheme);
    } catch (err) {
      console.error('Error saving theme preference:', err);
    }
  };

  return {
    theme,
    toggleTheme,
  };
}; 