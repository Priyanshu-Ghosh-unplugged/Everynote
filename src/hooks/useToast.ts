import { useCallback } from 'react';
import Toast from 'react-native-toast-message';

export const useToast = () => {
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    Toast.show({
      type,
      text1: type.charAt(0).toUpperCase() + type.slice(1),
      text2: message,
      position: 'bottom',
      visibilityTime: 4000,
    });
  }, []);

  return { showToast };
}; 