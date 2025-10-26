'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api/auth';
import type { User, ProfileUpdateRequest } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authentication state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === 'object') {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          // Invalid user data, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    } else if (storedToken || storedUser) {
      // Partial or invalid data, clear everything
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      
      // Validate response
      if (!response.token || !response.user) {
        throw new Error('Invalid login response');
      }
      
      // Store token and user in state
      setToken(response.token);
      setUser(response.user);
      
      // Persist to localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any partial state
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdateRequest) => {
    try {
      const response = await authApi.updateProfile(data);
      
      // Update user in state
      setUser(response.user);
      
      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
