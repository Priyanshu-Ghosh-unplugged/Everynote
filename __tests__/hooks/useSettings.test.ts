import { renderHook, act } from '@testing-library/react-hooks';
import { useSettings } from '../../src/hooks/useSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('useSettings', () => {
  beforeEach(() => {
    // Clear AsyncStorage mock before each test
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  test('should load default settings if none are saved', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for settings to load
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.settings).toEqual({
      fontSize: 16,
      fontFamily: 'System',
      syncEnabled: true,
      autoSave: true,
      defaultCategory: 'All',
      biometricEnabled: false,
    });
    expect(result.current.error).toBe(null);
  });

  test('should load saved settings', async () => {
    const savedSettings = {
      fontSize: 18,
      fontFamily: 'Arial',
      syncEnabled: false,
      autoSave: false,
      defaultCategory: 'Work',
      biometricEnabled: true,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedSettings));

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for settings to load
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.settings).toEqual(savedSettings);
    expect(result.current.error).toBe(null);
  });

  test('should update settings and save them', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); // Start with default settings

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    await waitForNextUpdate(); // Wait for initial load

    const newSettings = { syncEnabled: false, autoSave: false };

    await act(async () => {
      result.current.updateSettings(newSettings);
    });

    expect(result.current.settings.syncEnabled).toBe(false);
    expect(result.current.settings.autoSave).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'settings',
      JSON.stringify({
        fontSize: 16,
        fontFamily: 'System',
        syncEnabled: false,
        autoSave: false,
        defaultCategory: 'All',
        biometricEnabled: false,
      }),
    );
    expect(result.current.error).toBe(null);
  });

  test('should reset settings to default', async () => {
    const savedSettings = { // Some existing settings
      fontSize: 18,
      fontFamily: 'Arial',
      syncEnabled: false,
      autoSave: false,
      defaultCategory: 'Work',
      biometricEnabled: true,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedSettings));

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    await waitForNextUpdate(); // Wait for initial load

    await act(async () => {
      result.current.resetSettings();
    });

    expect(result.current.settings).toEqual({
      fontSize: 16,
      fontFamily: 'System',
      syncEnabled: true,
      autoSave: true,
      defaultCategory: 'All',
      biometricEnabled: false,
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'settings',
      JSON.stringify({
        fontSize: 16,
        fontFamily: 'System',
        syncEnabled: true,
        autoSave: true,
        defaultCategory: 'All',
        biometricEnabled: false,
      }),
    );
    expect(result.current.error).toBe(null);
  });

  test('should handle error when loading settings', async () => {
    const errorMessage = 'Failed to load';
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.settings).toEqual({
      fontSize: 16,
      fontFamily: 'System',
      syncEnabled: true,
      autoSave: true,
      defaultCategory: 'All',
      biometricEnabled: false,
    }); // Should still load default settings on error
    expect(result.current.error).toBe(errorMessage);
  });

   test('should handle error when updating settings', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); // Start with default settings

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    await waitForNextUpdate(); // Wait for initial load

    const errorMessage = 'Failed to save';
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const newSettings = { syncEnabled: false };

    await act(async () => {
      result.current.updateSettings(newSettings);
    });

    expect(result.current.settings.syncEnabled).toBe(false); // State is updated immediately
    expect(result.current.error).toBe(errorMessage);
  });

   test('should handle error when resetting settings', async () => {
    const savedSettings = { // Some existing settings
      fontSize: 18,
      fontFamily: 'Arial',
      syncEnabled: false,
      autoSave: false,
      defaultCategory: 'Work',
      biometricEnabled: true,
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedSettings));

    const { result, waitForNextUpdate } = renderHook(() => useSettings());

    await waitForNextUpdate(); // Wait for initial load

     const errorMessage = 'Failed to reset';
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      result.current.resetSettings();
    });

    expect(result.current.settings).toEqual({
      fontSize: 16,
      fontFamily: 'System',
      syncEnabled: true,
      autoSave: true,
      defaultCategory: 'All',
      biometricEnabled: false,
    }); // State is updated immediately to default
    expect(result.current.error).toBe(errorMessage);
  });
}); 