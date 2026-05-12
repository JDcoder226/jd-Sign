import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultThemeMode, getTheme } from '../theme';

const THEME_KEY = 'vaultgen_theme_mode';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(defaultThemeMode);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (mounted && saved) setModeState(saved);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback(async (nextMode) => {
    setModeState(nextMode);
    await AsyncStorage.setItem(THEME_KEY, nextMode);
  }, []);

  const value = useMemo(() => ({
    mode,
    setMode,
    theme: getTheme(mode),
    availableModes: ['cyber', 'light'],
  }), [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}