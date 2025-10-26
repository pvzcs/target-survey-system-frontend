import { apiClient } from './client';
import type { AuthResponse, ProfileUpdateRequest, ProfileUpdateResponse } from '@/types';

export const authApi = {
  login: (username: string, password: string): Promise<AuthResponse> =>
    apiClient.post('/auth/login', { username, password }),
  
  updateProfile: (data: ProfileUpdateRequest): Promise<ProfileUpdateResponse> =>
    apiClient.put('/auth/profile', data),
};
