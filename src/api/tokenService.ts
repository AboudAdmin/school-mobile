import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const tokenService = {
  getAccessToken: (): Promise<string | null> => SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string): Promise<void> => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),

  getRefreshToken: (): Promise<string | null> => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): Promise<void> => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),

  getUser: async (): Promise<any | null> => {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  setUser: (user: any): Promise<void> => SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),

  setTokens: async (access: string, refresh: string): Promise<void> => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
  },
  clear: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
