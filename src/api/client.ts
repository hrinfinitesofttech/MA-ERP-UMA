import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production API Base URL matching ERP-Test-1 and PythonAnywhere backend
export const DEFAULT_API_BASE_URL = 'https://erpuma.pythonanywhere.com/api';

// Configurable storage key
const ACCESS_TOKEN_KEY = 'UMA_ERP_ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'UMA_ERP_REFRESH_TOKEN';
const API_URL_KEY = 'UMA_ERP_CUSTOM_API_URL';

class TokenStorage {
  static async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  }
}

export const getStoredTokens = async () => {
  const access = await TokenStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = await TokenStorage.getItem(REFRESH_TOKEN_KEY);
  return { access, refresh };
};

export const saveTokens = async (access: string, refresh?: string) => {
  if (access) await TokenStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) await TokenStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const clearTokens = async () => {
  await TokenStorage.removeItem(ACCESS_TOKEN_KEY);
  await TokenStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getApiBaseUrl = async (): Promise<string> => {
  const customUrl = await AsyncStorage.getItem(API_URL_KEY);
  return customUrl || DEFAULT_API_BASE_URL;
};

export const setCustomApiBaseUrl = async (url: string) => {
  if (url) {
    await AsyncStorage.setItem(API_URL_KEY, url);
  } else {
    await AsyncStorage.removeItem(API_URL_KEY);
  }
};

const CAMEL = /[a-z0-9][A-Z]/;
const toSnake = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

/**
 * The backend answers with camelCase keys on most endpoints while parts of the app read
 * snake_case. Add a snake_case alias next to every camelCase key so both shapes work.
 */
export const withSnakeCaseAliases = (value: any): any => {
  if (Array.isArray(value)) return value.map(withSnakeCaseAliases);
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      const nv = withSnakeCaseAliases(v);
      out[k] = nv;
      if (CAMEL.test(k)) {
        const snake = toSnake(k);
        if (!(snake in value)) out[snake] = nv;
      }
    }
    return out;
  }
  return value;
};

export const apiClient = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor to attach Authorization Bearer Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Dynamic base URL check
    const currentBase = await getApiBaseUrl();
    if (config.baseURL !== currentBase) {
      config.baseURL = currentBase;
    }

    const { access } = await getStoredTokens();
    if (access && config.headers) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to auto-refresh expired JWT token on HTTP 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    response.data = withSnakeCaseAliases(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Avoid infinite refresh loops for auth endpoints
    if (
      originalRequest?.url?.includes('/auth/login/') ||
      originalRequest?.url?.includes('/auth/token/refresh/')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refresh } = await getStoredTokens();
      if (!refresh) {
        isRefreshing = false;
        await clearTokens();
        return Promise.reject(error);
      }

      try {
        const baseURL = await getApiBaseUrl();
        const refreshResponse = await axios.post(`${baseURL}/auth/token/refresh/`, {
          refresh,
        });

        if (refreshResponse.data?.access) {
          const newAccess = refreshResponse.data.access;
          await saveTokens(newAccess);
          apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          processQueue(null, newAccess);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh response did not contain access token');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
