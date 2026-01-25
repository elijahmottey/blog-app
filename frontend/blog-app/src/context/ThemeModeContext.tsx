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

const semanticTokens = {
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    primary: '#2563EB',
    onPrimary: '#FFFFFF',
    secondary: '#7C3AED',
    onSecondary: '#FFFFFF',
    textPrimary: '#0F1724',
    textSecondary: '#475569',
    chipBg: '#E6F0FF',
    chipText: '#0B3A66',
    icon: '#0F1724',
    divider: '#E5E7EB',
    success: '#16A34A',
    error: '#DC2626',
  },
  dark: {
    background: '#0B1220',
    surface: '#0B1220',
    primary: '#90caf9',
    onPrimary: '#07263e',
    secondary: '#CE93D8',
    onSecondary: '#2B122C',
    textPrimary: '#E5E7EB',
    textSecondary: '#A3A9B3',
    chipBg: '#123244',
    chipText: '#BFE6FF',
    icon: '#E5E7EB',
    divider: 'rgba(255,255,255,0.12)',
    success: '#81C784',
    error: '#EF9A9A',
  },
} as const;

function buildTheme(mode: ColorMode) {
  const tokens = semanticTokens[mode];
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: tokens.primary, contrastText: tokens.onPrimary },
      secondary: { main: tokens.secondary, contrastText: tokens.onSecondary },
      error: { main: tokens.error },
      success: { main: tokens.success },
      text: { primary: tokens.textPrimary, secondary: tokens.textSecondary },
      background: { default: tokens.background, paper: tokens.surface },
      divider: tokens.divider,
      custom: {
        chipBg: tokens.chipBg,
        chipText: tokens.chipText,
        icon: tokens.icon,
      } as any,
      contrastThreshold: 3,
      tonalOffset: 0.15,
    } as any,
    typography: { fontFamily: 'Roboto, Helvetica, Arial, sans-serif' },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none' },
          contained: { boxShadow: 'none' },
        },
      },
      MuiChip: {
        defaultProps: { color: 'default' },
        styleOverrides: {
          root: ({ theme }: any) => ({
            borderColor: theme.palette.divider,
            backgroundColor: (theme.palette as any).custom?.chipBg ?? tokens.chipBg,
            color: (theme.palette as any).custom?.chipText ?? tokens.chipText,
          }),
        },
      },
      MuiIconButton: {
        defaultProps: { color: 'default' },
        styleOverrides: {
          root: ({ theme }: any) => ({
            color: (theme.palette as any).custom?.icon ?? theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            },
          }),
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: ({ theme }: any) => ({ color: (theme.palette as any).custom?.icon ?? theme.palette.text.secondary }),
        },
      },
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: ({ theme }: any) => ({
            backgroundColor: isDark ? theme.palette.background.default : theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
          }),
        },
      },
      MuiLink: {
        styleOverrides: {
          root: ({ theme }: any) => ({ color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }),
        },
      },
      MuiCssBaseline: {
        styleOverrides: (themeParam: any) => ({
          body: { backgroundColor: themeParam.palette.background.default, color: themeParam.palette.text.primary },
          a: { color: themeParam.palette.primary.main },
        }),
      },
      MuiPaper: {
        styleOverrides: { outlined: ({ theme }: any) => ({ borderColor: theme.palette.divider }) },
      },
    },
  });
}

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ColorMode>(() => {
    const stored = (typeof window !== 'undefined') ? (localStorage.getItem(STORAGE_KEY) as ColorMode | null) : null;
    return stored ?? getSystemPreference();
  });

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ } }, [mode]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => { const stored = localStorage.getItem(STORAGE_KEY); if (!stored) { setModeState(media.matches ? 'dark' : 'light'); } };
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, []);

  // Ensure Tailwind's `dark` class toggles on the root <html> element
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    }
  }, [mode]);

  // Write semantic tokens as CSS variables so non-MUI parts (Tailwind, plain css) can consume them via var(--token)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const t = semanticTokens[mode];
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--bg', t.background);
    rootStyle.setProperty('--surface', t.surface);
    rootStyle.setProperty('--primary', t.primary);
    rootStyle.setProperty('--on-primary', t.onPrimary);
    rootStyle.setProperty('--secondary', t.secondary);
    rootStyle.setProperty('--text-primary', t.textPrimary);
    rootStyle.setProperty('--text-secondary', t.textSecondary);
    rootStyle.setProperty('--chip-bg', t.chipBg);
    rootStyle.setProperty('--chip-text', t.chipText);
    rootStyle.setProperty('--icon', t.icon);
    rootStyle.setProperty('--divider', t.divider);
  }, [mode]);

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
