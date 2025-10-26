'use client';

import { useState, useCallback } from 'react';
import { useApiError } from './use-api-error';
import { useToastContext } from '@/lib/contexts/toast-context';

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsync<T = any>(options: UseAsyncOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);
  const { handleError } = useApiError();
  const { success: showSuccess } = useToastContext();

  const execute = useCallback(
    async (asyncFn: () => Promise<T>) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        setData(result);

        // Show success message if provided
        if (options.successMessage) {
          showSuccess(options.successMessage);
        }

        // Call success callback if provided
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);

        // Handle error with custom message if provided
        handleError(err, options.errorMessage);

        // Call error callback if provided
        if (options.onError) {
          options.onError(err);
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, showSuccess, options]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
  };
}
