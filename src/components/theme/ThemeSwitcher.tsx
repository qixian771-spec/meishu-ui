import { ACCENT_THEME_LIST, type AccentThemeId } from '../../glass';
import { useAccentTheme } from '../../theme/AccentThemeContext';

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { themeId, setThemeId } = useAccentTheme();

  return (
    <div
      className={`theme-switcher ${compact ? 'theme-switcher--compact' : ''}`}
      data-testid="theme-switcher"
      role="radiogroup"
      aria-label="工作区色调"
    >
      {!compact && (
        <div className="theme-switcher-head">
          <div className="theme-switcher-title">工作区色调</div>
          <p className="theme-switcher-sub">7 套色调 · 「参考图」对齐图 1–3 · 「白瓷」为浅色</p>
        </div>
      )}
      <div className="theme-switcher-grid">
        {ACCENT_THEME_LIST.map((theme) => {
          const active = themeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`theme-chip ${active ? 'is-active' : ''}`}
              data-theme-chip={theme.id}
              onClick={() => setThemeId(theme.id as AccentThemeId)}
            >
              <span
                className="theme-chip-swatch"
                style={{ background: theme.swatch }}
                aria-hidden="true"
              />
              <span className="theme-chip-meta">
                <span className="theme-chip-label">{theme.label}</span>
                {!compact && <span className="theme-chip-hint">{theme.hint}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
