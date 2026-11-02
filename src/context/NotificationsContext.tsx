import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import { AppNotification, notificationsApi } from '../api/notifications';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  items: (AppNotification & { read: boolean })[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);
const REFRESH_MS = 3 * 60 * 1000;

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [raw, setRaw] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [all, read] = await Promise.all([notificationsApi.getAll(user?.id), notificationsApi.getReadIds()]);
      setRaw(all);
      setReadIds(read);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRaw([]);
      return;
    }
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [isAuthenticated, refresh]);

  const persist = (ids: string[]) => {
    setReadIds(ids);
    notificationsApi.saveReadIds(ids);
  };

  const value = useMemo<NotificationsContextType>(() => {
    const items = raw.map((n) => ({ ...n, read: readIds.includes(n.id) || n.serverRead === true }));
    return {
      items,
      unreadCount: items.filter((n) => !n.read).length,
      loading,
      refresh,
      markRead: (id) => !readIds.includes(id) && persist([...readIds, id]),
      markAllRead: () => persist(Array.from(new Set([...readIds, ...raw.map((n) => n.id)]))),
    };
  }, [raw, readIds, loading, refresh]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = (): NotificationsContextType => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
};
