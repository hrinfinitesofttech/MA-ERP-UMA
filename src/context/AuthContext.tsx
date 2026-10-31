import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../api/types';
import { authApi } from '../api/auth';
import { getStoredTokens } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    try {
      setIsLoading(true);
      const { access } = await getStoredTokens();
      const storedUser = await authApi.getStoredUser();

      if (access && storedUser) {
        setUser(storedUser);
        // Silently refresh current user from backend
        authApi.getCurrentUser().then(setUser).catch(() => {});
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (username: string, pass: string) => {
    try {
      const res = await authApi.login(username, pass);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Authentication failed. Please check credentials.' };
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        'Unable to connect to ERP server. Please verify your internet connection.';
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const fresh = await authApi.getCurrentUser();
      setUser(fresh);
    } catch {
      // Ignore if offline
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
