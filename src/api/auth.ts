import { apiClient, saveTokens, clearTokens } from './client';
import { AuthResponse, UserProfile } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = 'UMA_ERP_CURRENT_USER';

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login/', {
      username: username.trim(),
      password: password.trim(),
    });

    if (res.data?.access) {
      await saveTokens(res.data.access, res.data.refresh);
    }
    if (res.data?.user) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/auth/me/');
    if (res.data) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
    }
    return res.data;
  },

  getStoredUser: async (): Promise<UserProfile | null> => {
    try {
      const data = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout/').catch(() => {});
    } finally {
      await clearTokens();
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  },
};
