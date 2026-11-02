import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyTheme, THEME_PRESETS, ThemeId } from '../theme/colors';

const STORAGE_KEY = 'UMA_ERP_THEME_V1';

interface ThemeContextType {
  themeId: ThemeId;
  accent: string | null;
  isDark: boolean;
  setTheme: (id: ThemeId) => void;
  setAccent: (hex: string | null) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>('forge');
  const [accent, setAccentState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { themeId?: ThemeId; accent?: string | null };
          const id = THEME_PRESETS.some((t) => t.id === saved.themeId) ? (saved.themeId as ThemeId) : 'forge';
          applyTheme(id, saved.accent ?? null);
          setThemeId(id);
          setAccentState(saved.accent ?? null);
        }
      } catch {
        // fall back to default theme
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const update = useCallback((id: ThemeId, acc: string | null) => {
    applyTheme(id, acc);
    setThemeId(id);
    setAccentState(acc);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ themeId: id, accent: acc })).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      themeId,
      accent,
      isDark: THEME_PRESETS.find((t) => t.id === themeId)?.dark ?? false,
      setTheme: (id) => update(id, accent),
      setAccent: (hex) => update(themeId, hex),
      resetTheme: () => update('forge', null),
    }),
    [themeId, accent, update]
  );

  // Avoid a flash of the default theme before the saved one is applied.
  if (!ready) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
