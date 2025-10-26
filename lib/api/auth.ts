import { apiClient } from './client';
import type { AuthResponse } from '@/types';

export const authApi = {
  login: (username: string, password: string): Promise<AuthResponse> =>
    apiClient.post('/auth/login', { username, password }),
};
