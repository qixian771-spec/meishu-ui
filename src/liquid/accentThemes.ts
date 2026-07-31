/**
 * Compatibility re-export — pack truth lives in `src/glass/tokens/accentThemes`.
 * Prefer: `import { … } from '../glass'` (or `@/glass`).
 */
export {
  ACCENT_THEMES,
  ACCENT_THEME_LIST,
  ACCENT_THEME_ORDER,
  ACCENT_THEME_STORAGE_KEY,
  DEFAULT_ACCENT_THEME,
  isAccentThemeId,
  resolveAccentTheme,
  washForTheme,
} from '../glass/tokens/accentThemes';
export type {
  AccentTheme,
  AccentThemeId,
  UltrathinkColors,
  WashPalette,
  WashRole,
} from '../glass/tokens/accentThemes';
