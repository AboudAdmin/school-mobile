import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import apiClient, { API_URL, authEvents } from '../api/apiClient';
import { tokenService } from '../api/tokenService';
import { clearQueryCache } from '../api/queryClient';

export type Role = 'admin' | 'teacher' | 'student' | 'parent' | 'secretary';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: Role;
  status?: 'active' | 'inactive' | 'suspended';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const roleFromToken = (jwt: string): Role | null => {
  try {
    return JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).role ?? null;
  } catch {
    return null;
  }
};

/**
 * Interim session revalidation (there is no /auth/me yet, TASK-032): a refresh makes the server re-read the account
 * (suspended / inactive → 401) and issue a token that carries the current role. Runs before anything renders, so it cannot race
 * the interceptor's own refresh. No response (offline, flaky) keeps the stored session.
 */
const revalidate = async (stored: UserProfile): Promise<UserProfile | null> => {
  const refresh = await tokenService.getRefreshToken();
  if (!refresh) return stored;
  try {
    const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refresh }, { timeout: 8000 });
    const { accessToken, refreshToken: next } = res.data.data;
    await tokenService.setTokens(accessToken, next);
    const role = roleFromToken(accessToken);
    if (role && role !== stored.role) {
      const changed = { ...stored, role };
      await tokenService.setUser(changed);
      await clearQueryCache(); // cached data belongs to the previous role
      return changed;
    }
    return stored;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      await tokenService.clear();
      await clearQueryCache();
      return null;
    }
    return stored;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await tokenService.getUser();
        const token = await tokenService.getAccessToken();
        if (storedUser && token) {
          const live = await revalidate(storedUser);
          setUser(live);
          if (!live) setError('Your session has expired. Please log in again.');
        }
      } catch (err) {
        console.error('Failed to parse stored auth state', err);
        await tokenService.clear();
      } finally {
        setIsLoading(false);
      }
    })();

    const off = authEvents.on((e) => {
      if (e !== 'auth_session_expired') return;
      clearQueryCache();
      setUser(null);
      setError('Your session has expired. Please log in again.');
    });
    return () => {
      off();
    };
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password: password.trim(),
      });

      const { user: userProfile, accessToken, refreshToken } = response.data.data;

      await tokenService.setTokens(accessToken, refreshToken);
      await tokenService.setUser(userProfile);

      setUser(userProfile);
      return userProfile;
    } catch (err: any) {
      const backendMessage: string | undefined = err.response?.data?.message || err.response?.data?.error;
      const statusCode = err.response?.status;

      let errorMessage = 'Login failed. Please check your credentials.';

      if (statusCode === 401) {
        if (backendMessage?.toLowerCase().includes('inactive')) {
          errorMessage = 'Your account is inactive. Please contact administration.';
        } else if (backendMessage?.toLowerCase().includes('suspended')) {
          errorMessage = 'Your account has been temporarily suspended. Please contact administration.';
        } else {
          errorMessage = backendMessage || 'Invalid email or password.';
        }
      } else if (statusCode === 429) {
        errorMessage = 'Too many login attempts. Please try again after 15 minutes.';
      } else if (statusCode === 403) {
        errorMessage = 'You do not have permission to access this resource.';
      } else if (backendMessage) {
        errorMessage = backendMessage;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout failed or unreachable', err);
    } finally {
      await tokenService.clear();
      await clearQueryCache();
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, error, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
