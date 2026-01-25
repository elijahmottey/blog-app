import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export type ColorMode = 'light' | 'dark';

interface ThemeModeContextType {
  mode: ColorMode;
  toggleMode: () => void;
  setMode: (mode: ColorMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export const useThemeMode = (): ThemeModeContextType => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};

const STORAGE_KEY = 'app-color-mode';

function getSystemPreference(): ColorMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function buildTheme(mode: ColorMode) {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563EB',
      },
      error: {
        main: '#DC2626',
      },
      success: {
        main: '#16A34A',
      },
      text: {
        primary: isDark ? '#E5E7EB' : '#1F2937',
        secondary: isDark ? '#9CA3AF' : '#6B7280',
      },
      background: {
        default: isDark ? '#0B1220' : '#F9FAFB',
        paper: isDark ? '#111827' : '#FFFFFF',
      },
      divider: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB',
    },
    typography: {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          contained: {
            boxShadow: 'none',
          },
        },
      },
    },
  });
}

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ColorMode>(() => {
    const stored = (typeof window !== 'undefined') ? (localStorage.getItem(STORAGE_KEY) as ColorMode | null) : null;
    return stored ?? getSystemPreference();
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setModeState(media.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, []);

  const setMode = useCallback((m: ColorMode) => setModeState(m), []);
  const toggleMode = useCallback(() => setModeState(prev => (prev === 'light' ? 'dark' : 'light')), []);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, toggleMode, setMode }), [mode, toggleMode, setMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
