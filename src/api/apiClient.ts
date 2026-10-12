import axios from 'axios';
import i18n from 'i18next';
import type { InternalAxiosRequestConfig } from 'axios';
import { tokenService } from './tokenService';
import { apiErrors, classifyError } from './errors';

// RN replacement for the web's window CustomEvents ('auth_session_expired' / 'auth_forbidden')
type AuthEvent = 'auth_session_expired' | 'auth_forbidden';
const listeners = new Set<(e: AuthEvent) => void>();
export const authEvents = {
  on: (fn: (e: AuthEvent) => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emit: (e: AuthEvent) => listeners.forEach((fn) => fn(e)),
};

// Must be reachable from the device: use the dev machine's LAN IP, not localhost
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject the Bearer token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // the interface language: the server shows its fixed system texts (notifications) in it
    if (config.headers && i18n.language) config.headers['Accept-Language'] = i18n.language;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refreshes and buffer parallel requests
let isRefreshing = false;
let failedQueue: { resolve: (token: string | null) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 429) {
      const retryAfter = error.response?.headers?.['retry-after'] || 15;
      console.warn(`Rate limit exceeded. Try again after ${retryAfter} seconds.`);
      apiErrors.emit(classifyError(error));
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      console.warn('Access denied. You do not have permission for this action.');
      authEvents.emit('auth_forbidden');
      return Promise.reject(error);
    }

    // any screen, query or not (login included): the one place 5xx becomes the generic message
    if (error.response?.status >= 500) apiErrors.emit(classifyError(error));

    const isAuthError = error.response?.status === 401;
    const isRefreshOrLoginRequest =
      originalRequest?.url?.includes('/auth/refresh') || originalRequest?.url?.includes('/auth/login');

    if (isAuthError && !originalRequest._retry && !isRefreshOrLoginRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = await tokenService.getRefreshToken();
      if (!storedRefreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
          refreshToken: storedRefreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        await tokenService.setTokens(accessToken, newRefreshToken);

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // No response = flaky connection, not a rejected session: keep the tokens and let the next request retry
        if (axios.isAxiosError(refreshError) && !refreshError.response) return Promise.reject(refreshError);

        await tokenService.clear();
        authEvents.emit('auth_session_expired');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
