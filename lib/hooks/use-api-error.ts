'use client';

import { useCallback } from 'react';
import { useToastContext } from '@/lib/contexts/toast-context';
import { useRouter } from 'next/navigation';

interface ApiError {
  status: number;
  code: string;
  message: string;
}

export function useApiError() {
  const { error: showError } = useToastContext();
  const router = useRouter();

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    const apiError = error as ApiError;

    // Use custom message if provided, otherwise use error message
    const message = customMessage || apiError.message || '操作失败';

    // Handle specific error types
    switch (apiError.status) {
      case 401:
        // Unauthorized - redirect to login (already handled in interceptor)
        showError('登录已过期，请重新登录');
        break;
      
      case 403:
        // Forbidden - show permission error
        showError('您没有权限执行此操作');
        break;
      
      case 404:
        // Not Found - show not found error
        showError(message);
        break;
      
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        showError('服务器错误，请稍后重试');
        break;
      
      case 0:
        // Network error
        if (apiError.code === 'NETWORK_ERROR') {
          showError('网络连接失败，请检查您的网络');
        } else {
          showError(message);
        }
        break;
      
      default:
        // Other errors
        showError(message);
    }

    // Log error for debugging
    console.error('API Error:', apiError);
  }, [showError, router]);

  return { handleError };
}
