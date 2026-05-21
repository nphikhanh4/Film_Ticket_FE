import React, { createContext, useState, useCallback, useEffect } from 'react';
import { User, AuthState } from '@/types/api';
import { authApi } from '@/api/auth';
import { extractRoleFromToken } from '@/utils/tokenUtils';

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = sessionStorage.getItem('auth_token');
    const userJson = sessionStorage.getItem('auth_user');
    const user = userJson ? JSON.parse(userJson) : null;

    return {
      user,
      token,
      isLoading: false,
      error: null,
    };
  });

  const login = useCallback(async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      console.log('🔐 Login attempt:', username);
      const response = await authApi.login({ username, password });
      console.log('✅ Login response received');

      const roleFromToken = extractRoleFromToken(response.accessToken);
      console.log('🔑 Role extracted from token:', roleFromToken);

      const user: User = {
        id: '',
        username,
        role: roleFromToken as 'user' | 'admin' | undefined,
      };

      // Try to fetch current user for additional info
      try {
        const currentUser = await authApi.me();
        console.log('👤 Current user from /me:', currentUser);
        user.id = currentUser.id;
        if (currentUser.role && !roleFromToken) {
          user.role = currentUser.role;
        }
      } catch (err) {
        console.log('⚠️ /me endpoint failed, using token role');
        user.id = username;
      }

      sessionStorage.setItem('auth_token', response.accessToken);
      sessionStorage.setItem('auth_user', JSON.stringify(user));
      console.log('💾 User saved:', { username: user.username, role: user.role });

      setState({
        user,
        token: response.accessToken,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.log('❌ Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authApi.register({ username, password });
      const roleFromToken = extractRoleFromToken(response.accessToken);

      const user: User = {
        id: username,
        username,
        role: roleFromToken as 'user' | 'admin' | undefined,
      };

      // Fetch current user
      try {
        const currentUser = await authApi.me();
        user.id = currentUser.id;
        if (currentUser.role && !roleFromToken) {
          user.role = currentUser.role;
        }
      } catch {
        // If me() fails, use username as id
      }

      sessionStorage.setItem('auth_token', response.accessToken);
      sessionStorage.setItem('auth_user', JSON.stringify(user));

      setState({
        user,
        token: response.accessToken,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    isAuthenticated: !!state.token,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
