import { useState, useCallback } from 'react';

export const useLoading = (initialState: boolean = false) => {
  const [loading, setLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);

  const startLoading = useCallback((message?: string) => {
    setLoading(true);
    if (message) {
      setLoadingMessage(message);
    }
    setLoadingProgress(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
    setLoadingMessage(null);
    setLoadingProgress(null);
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingProgress(progress);
  }, []);

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      startLoading(message);
      const result = await operation();
      return result;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    loadingMessage,
    loadingProgress,
    startLoading,
    stopLoading,
    updateProgress,
    withLoading,
  };
}; 