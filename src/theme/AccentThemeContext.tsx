import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ACCENT_THEME_STORAGE_KEY,
  ACCENT_THEMES,
  DEFAULT_ACCENT_THEME,
  applyThemeTokens,
  isAccentThemeId,
  resolveAccentTheme,
  resolveThemeTokens,
  type AccentTheme,
  type AccentThemeId,
  type ThemeTokens,
} from '../glass';

type AccentThemeContextValue = {
  themeId: AccentThemeId;
  theme: AccentTheme;
  tokens: ThemeTokens;
  setThemeId: (id: AccentThemeId) => void;
};

const AccentThemeContext = createContext<AccentThemeContextValue | null>(null);

function readStoredTheme(): AccentThemeId {
  try {
    const raw = localStorage.getItem(ACCENT_THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_ACCENT_THEME;
    if (raw === 'mint') {
      localStorage.setItem(ACCENT_THEME_STORAGE_KEY, 'ref123');
      return 'ref123';
    }
    if (isAccentThemeId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_ACCENT_THEME;
}

export function AccentThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<AccentThemeId>(readStoredTheme);

  const setThemeId = useCallback((id: AccentThemeId) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(ACCENT_THEME_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const theme = ACCENT_THEMES[themeId];
  const tokens = useMemo(() => resolveThemeTokens(themeId), [themeId]);

  useEffect(() => {
    applyThemeTokens(tokens);
  }, [tokens]);

  const value = useMemo(
    () => ({ themeId, theme, tokens, setThemeId }),
    [themeId, theme, tokens, setThemeId],
  );

  return (
    <AccentThemeContext.Provider value={value}>{children}</AccentThemeContext.Provider>
  );
}

export function useAccentTheme(): AccentThemeContextValue {
  const ctx = useContext(AccentThemeContext);
  if (!ctx) {
    const theme = resolveAccentTheme(DEFAULT_ACCENT_THEME);
    const tokens = resolveThemeTokens(DEFAULT_ACCENT_THEME);
    return {
      themeId: DEFAULT_ACCENT_THEME,
      theme,
      tokens,
      setThemeId: () => undefined,
    };
  }
  return ctx;
}
