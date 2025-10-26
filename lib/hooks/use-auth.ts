import { useAuthContext } from '@/lib/contexts/auth-context';

/**
 * Custom hook to access authentication context
 * Provides user, token, login, logout, and authentication status
 */
export function useAuth() {
  return useAuthContext();
}
