import axios, { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// Create Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Log API requests for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => {
    // API returns { success: true, data: {...} }
    // Extract the actual data from the wrapper
    const apiResponse = response.data;
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      return apiResponse.data;
    }
    return apiResponse;
  },
  (error: AxiosError<{ error: ApiError }>) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const errorData = error.response.data?.error;
      const isLoginRequest = error.config?.url?.includes('/auth/login');

      switch (status) {
        case 401:
          // Unauthorized - Token expired or invalid
          // Don't redirect if this is a login request failure
          if (typeof window !== 'undefined' && !isLoginRequest) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - Insufficient permissions
          console.error('403 Forbidden:', errorData?.message || 'Access denied');
          break;
        case 404:
          // Not Found - Resource doesn't exist
          console.error('404 Not Found:', errorData?.message || 'Resource not found');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          console.error(`${status} Server Error:`, errorData?.message || 'Internal server error');
          break;
        default:
          console.error(`API Error ${status}:`, errorData?.message || 'Unknown error');
      }

      return Promise.reject({
        status,
        code: errorData?.code || `HTTP_${status}`,
        message: errorData?.message || getDefaultErrorMessage(status),
      });
    } else if (error.request) {
      // Request was made but no response received - Network error
      console.error('Network Error:', error.message);
      return Promise.reject({
        status: 0,
        code: 'NETWORK_ERROR',
        message: '网络连接失败，请检查您的网络连接',
      });
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
      return Promise.reject({
        status: 0,
        code: 'REQUEST_ERROR',
        message: error.message || '请求失败',
      });
    }
  }
);

// Helper function to get default error messages
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return '请求参数错误';
    case 401:
      return '未授权，请重新登录';
    case 403:
      return '权限不足';
    case 404:
      return '请求的资源不存在';
    case 500:
      return '服务器内部错误';
    case 502:
      return '网关错误';
    case 503:
      return '服务暂时不可用';
    case 504:
      return '网关超时';
    default:
      return '请求失败';
  }
}
