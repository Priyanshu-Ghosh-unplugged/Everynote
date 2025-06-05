import { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';

export interface ErrorState {
  message: string;
  code?: string;
  timestamp: number;
}

export const useError = () => {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorCode = error instanceof Error ? error.name : 'UNKNOWN_ERROR';
    
    setError({
      message: errorMessage,
      code: errorCode,
      timestamp: Date.now(),
    });

    // Show toast notification
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
      position: 'bottom',
      visibilityTime: 4000,
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}; 